import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Workspace } from 'src/app/models/workspace';
import { EventsService } from 'src/app/services/events.service';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';

import { UserNotificationWorkspaceWithRequiredAccess } from 'src/app/models/userNotificationWorkspaceWithRequiredAccess';
import { UserNotificationToSave } from 'src/app/models/UserNotificationToSave';
import { ApproveUserWantToJoinToWorkspaceDialogComponent } from '../approve-user-want-to-join-to-workspace-dialog/approve-user-want-to-join-to-workspace-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public setCurrentWorkspaceSubscriptions: any;

  foods: any[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private eventsService: EventsService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    public dialog: MatDialog) { }

  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;
  public currentUserNotifications = new Array<UserNotificationWorkspaceWithRequiredAccess>();

  @Output() toggleSidenav = new EventEmitter<void>();
  @Input() shouldShowBackToDashboard = false;

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

    this.subscribeEvents();
    this.getUserNotification();
  }

  onSetNotificationAsReadClick() {
    //this.currentUserInRetroBoardApiService.setNotificationAsRead()

  }

  goToNotifyDetail(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    const dialogRef = this.dialog.open(ApproveUserWantToJoinToWorkspaceDialogComponent, {
      width: '600px',
      data: {
        userNotificationWorkspaceWithRequiredAccess: userNotification,
        currentUser: this.currentUser
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.shouldRefreshTeams) {

        }
      }
    });
  }


  getUserNotification() {
    this.currentUserInRetroBoardApiService.getUserNotification(this.currentUser.uid)
      .then(response => {
        if (response !== undefined && response !== null) {
          if (response.length > 0) {
            this.prepareUsrNotification(response);
          }
        }
      })
      .catch(error => {
        const err = error;
    });
  }

  userNotifictaionHasNoReadNotify() {
    return this.currentUserNotifications.some(cun => !cun.userNotification.isRead);
  }

  private prepareUsrNotification(response: UserNotificationWorkspaceWithRequiredAccess[]) {
    this.currentUserNotifications = response;
    this.sortCurrentUserNoitficationByIsReadByAsc();
  }

  backToDashboard() {
    this.eventsService.emitSetReciveGoOutFromAllRetroBoardListEmiter();
    this.router.navigate(['/']);
  }

  signOut() {
    this.auth.signOut();

  }

  emitMenu() {
    this.toggleSidenav.emit();
  }

  private subscribeEvents() {
    this.setCurrentWorkspaceSubscriptions =
      this.eventsService.getSetNewCurrentWorkspaceEmiterEmiter().subscribe(currentWorkspace => {
        this.currentUserWorkspaceName = currentWorkspace.name;
      });
  }

  sortCurrentUserNoitficationByIsReadByAsc() {
    this.currentUserNotifications.sort((leftSide, rightSide): number => {
      if (leftSide.userNotification.isRead < rightSide.userNotification.isRead) { return -1; }
      if (leftSide.userNotification.isRead > rightSide.userNotification.isRead) { return 1; }

      return 0;
    });
  }

}
