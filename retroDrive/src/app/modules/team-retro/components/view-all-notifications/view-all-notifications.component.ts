import { Component, OnInit } from '@angular/core';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { MatDialog } from '@angular/material/dialog';
import { UserNotificationWorkspaceWithRequiredAccess } from 'src/app/models/userNotificationWorkspaceWithRequiredAccess';
import { User } from 'src/app/models/user';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-view-all-notifications',
  templateUrl: './view-all-notifications.component.html',
  styleUrls: ['./view-all-notifications.component.css']
})
export class ViewAllNotificationsComponent implements OnInit {

  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;
  public currentUserNotifications = new Array<UserNotificationWorkspaceWithRequiredAccess>();

  constructor(
    public auth: AuthService,
    private localStorageService: LocalStorageService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    public dialog: MatDialog,
    private eventsService: EventsService) { }

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');

    if (this.currentUser === undefined) {
      this.auth.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getItem('userWorkspace');
        const currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;
        this.currentUserWorkspaceName = currentWorkspace.name;
      }
    }

    this.getUserNotification();
  }

  getUserNotification() {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getUserNotyficationFromApi();
      });
    } else {
      this.getUserNotyficationFromApi();
    }
  }

  isAceptedByOwnerAndIsApproved(userNotification: UserNotificationWorkspaceWithRequiredAccess): boolean {
    const isAccpeted =
      userNotification.userWaitingToApproveWorkspaceJoin.isApprovalByCreator &&
      userNotification.userWaitingToApproveWorkspaceJoin.requestIsApprove;

    return isAccpeted;
  }

  private getUserNotyficationFromApi() {
    this.currentUserInRetroBoardApiService.getUserNotification(this.currentUser.uid)
      .then(response => {
        if (response !== undefined && response !== null) {
          this.eventsService.emitSetAllRetroBoardBackgroudnNoMoreHigherEmiter();
          this.prepareUsrNotification(response);
        }
      })
      .catch(error => {
        const err = error;
      });
  }

  private prepareUsrNotification(response: any) {
    this.currentUserNotifications = new Array<UserNotificationWorkspaceWithRequiredAccess>();
    if (response.userNotificationWorkspaceWithRequiredAccesses !== undefined &&
        response.userNotificationWorkspaceWithRequiredAccesses !== null) {
          if (response.userNotificationWorkspaceWithRequiredAccesses.length > 0) {
            const userNotificationWorkspaceWithRequiredAccesses = response.userNotificationWorkspaceWithRequiredAccesses as any[];
            userNotificationWorkspaceWithRequiredAccesses.forEach(userNotificationWorkspaceWithRequiredAccess => {
              this.currentUserNotifications.push(userNotificationWorkspaceWithRequiredAccess);
            });
          }
    }
    if (response.userNotificationWorkspaceWithRequiredAccessResponses !== undefined &&
        response.userNotificationWorkspaceWithRequiredAccessResponses !== null) {
      if (response.userNotificationWorkspaceWithRequiredAccessResponses.length > 0) {
        const userNotificationWorkspaceWithRequiredAccessResponses = response.userNotificationWorkspaceWithRequiredAccessResponses as any[];
        userNotificationWorkspaceWithRequiredAccessResponses.forEach(userNotificationWorkspaceWithRequiredAccessResponse => {
          this.currentUserNotifications.push(userNotificationWorkspaceWithRequiredAccessResponse);
        });
      }
    }
    this.sortCurrentUserNoitficationByIsReadByAsc();
  }

  sortCurrentUserNoitficationByIsReadByAsc() {
    this.currentUserNotifications.sort((leftSide, rightSide): number => {
      if (leftSide.userNotification.isRead < rightSide.userNotification.isRead) { return -1; }
      if (leftSide.userNotification.isRead > rightSide.userNotification.isRead) { return 1; }

      return 0;
    });
  }
}
