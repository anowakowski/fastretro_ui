import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';

import { User } from 'src/app/models/user';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Router } from '@angular/router';
import { FirestoreRetroBoardService } from 'src/app/modules/team-retro/services/firestore-retro-board.service';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { MatDialog } from '@angular/material/dialog';
import { UserNotificationWorkspaceWithRequiredAccess } from 'src/app/models/userNotificationWorkspaceWithRequiredAccess';
import { UserNotificationDetailsDialogComponent } from '../user-notification-details-dialog copy/user-notification-details-dialog.component';
import { UserSettingsDialogComponent } from '../user-settings-dialog/user-settings-dialog.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {

  public shouldChangeRetroDisplayText = false;

  public stopRetroInProgressProcessSubscriptions: any;
  public startRetroInProgressProcessSubscriptions: any;
  public setCurrentWorkspaceSubscriptions: any;

  public userNotificationSubscription: any;
  public allNotificationSubscription: any;
  public setRefreshNotificationSubscription: any;

  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;
  public currentUserNotifications = new Array<UserNotificationWorkspaceWithRequiredAccess>();

  constructor(
    private eventsServices: EventsService,
    private localStorageService: LocalStorageService,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    private eventsService: EventsService,
    public dialog: MatDialog,
    private router: Router) { }

  ngOnInit() {
    this.currentUser = this.localStorageService.getDecryptedItem(this.localStorageService.currentUserKey);
    this.userWorkspace = this.localStorageService.getDecryptedItem(this.localStorageService.userWorkspaceKey);
    const currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;
    this.currentUserWorkspaceName = currentWorkspace.name;

    this.subscribeEvents();
    this.subscribeUserNotification();
  }

  ngOnDestroy() {
    this.stopRetroInProgressProcessSubscriptions.unsubscribe();
    this.startRetroInProgressProcessSubscriptions.unsubscribe();
    this.setCurrentWorkspaceSubscriptions.unsubscribe();
  }

  goToNotifyDetail(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    const dialogRef = this.dialog.open(UserNotificationDetailsDialogComponent, {
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
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getUserNotyficationFromApi();
      });
    } else {
      this.getUserNotyficationFromApi();
    }
  }

  userNotifictaionHasNoReadNotify() {
    return this.currentUserNotifications.some(cun => !cun.userNotification.isRead);
  }

  isAceptedByOwnerAndIsApproved(userNotification: UserNotificationWorkspaceWithRequiredAccess): boolean {
    const isAccpeted =
      userNotification.userWaitingToApproveWorkspaceJoin.isApprovalByCreator &&
      userNotification.userWaitingToApproveWorkspaceJoin.requestIsApprove;

    return isAccpeted;
  }

  stopTimer() {
    this.shouldChangeRetroDisplayText = true;
  }

  backToDashboard() {
    this.router.navigate(['/']);
  }

  goToViewAllNotifications() {
    this.eventsServices.emitSetAllNotificationViewAsDefaultSectionEmiter();
    this.router.navigate(['/retro/all-your-notifications']);
  }

  onUserSettings() {
    this.openUserSettingsDialogComponentDialog();
  }

  private openUserSettingsDialogComponentDialog() {
    const dialogRef = this.dialog.open(UserSettingsDialogComponent, {
      width: '1600px',
      data: {
        currentUser: this.currentUser
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.shouldRefreshUserSettings) {
          this.eventsService.emitRefreshAfterUserSettingsWasChangedEmiter();
        }
      }
    });
  }

  private subscribeUserNotification() {
    this.userNotificationSubscription =
      this.firestoreService.getUserNotificationSnapshotChanges(this.currentUser.uid).subscribe(userNotificationsSnapshot => {
      if (userNotificationsSnapshot.length === 0) {
        this.allNotificationSubscription =
          this.firestoreService.getAllUserNotificationSnapshotChanges().subscribe(allNotificationsSnapshot => {
          const findedNotification = allNotificationsSnapshot.find( ns => (ns.payload.doc.data() as any).userId === this.currentUser.uid);
          if (findedNotification !== undefined && findedNotification !== null) {
            this.getUserNotyficationFromApi();
          }
        });
      } else {
        userNotificationsSnapshot.forEach(userNotificationSnapshot => {
          const findedUserNotification = userNotificationSnapshot.payload.doc.data();
          this.getUserNotyficationFromApi();
        });
      }
    });
  }

  private getUserNotyficationFromApi() {
    this.currentUserInRetroBoardApiService.getUserNotification(this.currentUser.uid)
      .then(response => {
        if (response !== undefined && response !== null) {
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

  private subscribeEvents() {
    this.stopRetroInProgressProcessSubscriptions =
      this.eventsServices.getStopRetroInProgressProcessEmiter().subscribe(shouldStopRetroProcess => {
      if (shouldStopRetroProcess) {
        this.shouldChangeRetroDisplayText = shouldStopRetroProcess;
      }
    });

    this.startRetroInProgressProcessSubscriptions =
      this.eventsServices.getStartRetroInProgressProcessEmiter().subscribe(shouldStartRetroProcess => {
      if (shouldStartRetroProcess) {
        this.shouldChangeRetroDisplayText = false;
      }
    });

    this.setCurrentWorkspaceSubscriptions =
      this.eventsServices.getSetNewCurrentWorkspaceEmiterEmiter().subscribe(currentWorkspace => {
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
