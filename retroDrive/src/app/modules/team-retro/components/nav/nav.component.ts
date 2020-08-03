import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
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

import { MatDialog } from '@angular/material/dialog';
import { UserNotificationDetailsDialogComponent } from '../user-notification-details-dialog/user-notification-details-dialog.component';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

  public setCurrentWorkspaceSubscriptions: any;
  public userNotificationSubscription: any;
  public allNotificationSubscription: any;
  public setRefreshNotificationSubscription: any;

  foods: any[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
  notificationCount: number;

  constructor(
    public auth: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private eventsService: EventsService,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    public dialog: MatDialog) { }

  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;
  public currentUserNotifications = new Array<UserNotificationWorkspaceWithRequiredAccess>();

  @Output() toggleSidenav = new EventEmitter<void>();
  @Input() shouldShowBackToDashboard = false;

  ngOnInit() {
    this.currentUser = this.localStorageService.getDecryptedItem(this.localStorageService.currentUserKey);

    if (this.currentUser === undefined) {
      this.auth.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getDecryptedItem(this.localStorageService.userWorkspaceKey);
        const currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;
        this.currentUserWorkspaceName = currentWorkspace.name;
      }
    }

    this.subscribeEvents();
    this.subscribeUserNotification();
  }

  ngOnDestroy(): void {
    this.unsubscribeEvents();
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

  goToViewAllNotifications() {
    this.eventsService.emitSetAllNotificationViewAsDefaultSectionEmiter();
    this.router.navigate(['/retro/all-your-notifications']);
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
    this.notificationCount = this.currentUserNotifications.length;
    this.sortCurrentUserNoitficationByCreationDateDesc();
    this.sortCurrentUserNoitficationByIsReadByAsc();

    this.getMaxItemsToShow();
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
    this.setRefreshNotificationSubscription = this.eventsService.getsetRefreshNotificationEmiter().subscribe(() => {
      this.getUserNotification();
    });
  }

  private unsubscribeEvents() {
    if (this.userNotificationSubscription !== undefined) {
      this.userNotificationSubscription.unsubscribe();
    }
    if (this.setCurrentWorkspaceSubscriptions !== undefined) {
      this.setCurrentWorkspaceSubscriptions.unsubscribe();
    }
    if (this.allNotificationSubscription !== undefined) {
      this.allNotificationSubscription.unsubscribe();
    }
    if (this.setRefreshNotificationSubscription !== undefined) {
      this.setRefreshNotificationSubscription.unsubscribe();
    }
  }

  private getMaxItemsToShow() {
    this.currentUserNotifications = this.currentUserNotifications.splice(0, 10);
  }

  sortCurrentUserNoitficationByIsReadByAsc() {
    this.currentUserNotifications.sort((leftSide, rightSide): number => {
      if (leftSide.userNotification.isRead < rightSide.userNotification.isRead) { return -1; }
      if (leftSide.userNotification.isRead > rightSide.userNotification.isRead) { return 1; }

      return 0;
    });
  }

  sortCurrentUserNoitficationByCreationDateDesc() {
    this.currentUserNotifications.sort((leftSide, rightSide): number => {
      if (leftSide.userNotification.creatonDate > rightSide.userNotification.creatonDate) { return -1; }
      if (leftSide.userNotification.creatonDate < rightSide.userNotification.creatonDate) { return 1; }

      return 0;
    });
  }

}
