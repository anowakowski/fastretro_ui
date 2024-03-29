import { Component, OnInit, OnDestroy } from '@angular/core';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { MatDialog } from '@angular/material/dialog';
import { UserNotificationWorkspaceWithRequiredAccess } from 'src/app/models/userNotificationWorkspaceWithRequiredAccess';
import { User } from 'src/app/models/user';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { UserNotificationDetailsDialogComponent } from '../user-notification-details-dialog/user-notification-details-dialog.component';
import { UserWorkspaceDataToSave } from 'src/app/models/userWorkspaceDataToSave';
import { formatDate } from '@angular/common';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RetroBoardSnackbarComponent } from '../retro-board-snackbar/retro-board-snackbar.component';

@Component({
  selector: 'app-view-all-notifications',
  templateUrl: './view-all-notifications.component.html',
  styleUrls: ['./view-all-notifications.component.css']
})
export class ViewAllNotificationsComponent implements OnInit, OnDestroy {

  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;
  public currentUserNotifications = new Array<UserNotificationWorkspaceWithRequiredAccess>();
  userNotificationAllViewSubscription: any;
  allNotificationInAllViewSubscription: any;

  constructor(
    public auth: AuthService,
    private localStorageService: LocalStorageService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    private firestoreService: FirestoreRetroBoardService,
    public dialog: MatDialog,
    private eventsService: EventsService,
    private snackBar: MatSnackBar) { }

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

    this.subscribeUserNotification();
  }

  ngOnDestroy(): void {
    this.unsubscribeEvents();
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

  isAcpetedByOwner(userNotification: UserNotificationWorkspaceWithRequiredAccess): boolean {
    return userNotification.userWaitingToApproveWorkspaceJoin.isApprovalByCreator;
  }

  goToNotifyDetail(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    const dialogRef = this.dialog.open(UserNotificationDetailsDialogComponent, {
      width: '600px',
      data: {
        userNotificationWorkspaceWithRequiredAccess: userNotification,
        currentUser: this.currentUser
      }
    });
  }

  openSnackbar(displayText, shouldShowWarningMessage) {
    const durationInSeconds = 5;
    this.snackBar.openFromComponent(RetroBoardSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        shouldShowWarningMessage,
        displayText
      }
    });
  }

  approveUserWantToJoinToWorkspace(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    const requestIsApprove = true;
    this.currentUserInRetroBoardApiService.setApproveUserWantToJoinToWorkspace(
      userNotification.userWantToJoinFirebaseId,
      userNotification.creatorUserFirebaseId,
      userNotification.workspceWithRequiredAccessFirebaseId,
      requestIsApprove
      )
      .then(() => {
        this.addToUserWorkspaces(userNotification, true);
      })
      .catch(error => {
        const err = error;
      });
  }

  rejectUserWantToJoinToWorkspace(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    const requestIsApprove = false;
    this.currentUserInRetroBoardApiService.setApproveUserWantToJoinToWorkspace(
      userNotification.userWantToJoinFirebaseId,
      userNotification.creatorUserFirebaseId,
      userNotification.workspceWithRequiredAccessFirebaseId,
      requestIsApprove
      )
      .then(() => {
        this.setNotificationAsRead(userNotification);
        this.setUserNotificationForuserWaitingToApproveWorkspaceJoin(userNotification, false);
      })
      .catch(error => {
        const err = error;
      });
  }

  setNotificationAsReadForWorkspaceWithRequiredAccessResponse(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    this.currentUserInRetroBoardApiService.setUserNotificationAsReadForWorkspaceWithRequiredAccessResponse(
      userNotification.userNotification.id
    )
    .then(() => {
      this.eventsService.emitSetRefreshNotificationEmiter();
      this.getUserNotification();
    })
    .catch(error => {
      const err = error;
    });
  }

  private addToUserWorkspaces(userNotification: UserNotificationWorkspaceWithRequiredAccess, isApproved) {
    this.firestoreService.getUserWorkspace(userNotification.userWantToJoinFirebaseId).then(userWorkspaceSnapshot => {
      const workspacesToAddToUserWorkspace: UserWorkspaceDataToSave = {
        workspace: this.firestoreService.addWorkspaceAsRef(userNotification.workspceWithRequiredAccessFirebaseId),
        isCurrent: false
      };
      const findedUserWorkspace = userWorkspaceSnapshot.docs[0].data() as UserWorkspaceToSave;
      const findedUserWorkspaceId = userWorkspaceSnapshot.docs[0].id as string;
      findedUserWorkspace.workspaces.push(workspacesToAddToUserWorkspace);
      this.firestoreService.updateUserWorkspaces(findedUserWorkspace, findedUserWorkspaceId);

      this.setNotificationAsRead(userNotification);
      this.setUserNotificationForuserWaitingToApproveWorkspaceJoin(userNotification, isApproved);
    });
  }

  private setUserNotificationForuserWaitingToApproveWorkspaceJoin(
    userNotification: UserNotificationWorkspaceWithRequiredAccess,
    isApproved) {
      const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
      const usrNotificationToSave = {
        creationDate: currentDate,
        userId: userNotification.userWantToJoinFirebaseId
      };
      this.firestoreService.addNewUserNotification(usrNotificationToSave).then(userNotificationSnapshot => {
        const userNotificationDocId = userNotificationSnapshot.id;
        this.setUserNotificationForuserWaitingToApproveWorkspaceJoinInApi(userNotification, userNotificationDocId, isApproved);
      });
  }

  private setUserNotificationForuserWaitingToApproveWorkspaceJoinInApi(
    userNotification: UserNotificationWorkspaceWithRequiredAccess,
    userNotificationDocId,
    isApproved) {
      this.currentUserInRetroBoardApiService
        .setUserNotificationForuserWaitingToApproveWorkspaceJoin(
          userNotification.userWaitingToApproveWorkspaceJoinId,
          userNotificationDocId
        )
        .then(() => {
          if (isApproved) {
            this.openSnackbar('you have accepted joining the user to workspace', false);
          } else {
            this.openSnackbar('you have rejected joining the user to workspace', true);
          }
          this.getUserNotification();
        })
        .catch(error => {
          const err = error;
        });
  }

  private setNotificationAsRead(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    this.currentUserInRetroBoardApiService.setUserNotificationAsRead(
      userNotification.userWantToJoinFirebaseId,
      userNotification.creatorUserFirebaseId,
      userNotification.workspceWithRequiredAccessFirebaseId,
      userNotification.userWaitingToApproveWorkspaceJoinId
    )
    .then(() => {
      this.eventsService.emitSetRefreshNotificationEmiter();
    })
    .catch(error => {
      const err = error;
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
    if (this.currentUserNotifications.length > 12) {
      this.eventsService.emitSetAllRetroBoardBackgroudnNoMoreHigherEmiter();
    } else {
      this.eventsService.emitSetAllRetroBoardBackgroudnMoreHigherEmiter();
    }
    this.sortCurrentUserNoitficationByCreationDateDesc();
    this.sortCurrentUserNoitficationByIsReadByAsc();
  }

  private subscribeUserNotification() {
    this.userNotificationAllViewSubscription =
      this.firestoreService.getUserNotificationSnapshotChanges(this.currentUser.uid).subscribe(userNotificationsSnapshot => {
      if (userNotificationsSnapshot.length === 0) {
        this.allNotificationInAllViewSubscription =
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

  private sortCurrentUserNoitficationByIsReadByAsc() {
    this.currentUserNotifications.sort((leftSide, rightSide): number => {
      if (leftSide.userNotification.isRead < rightSide.userNotification.isRead) { return -1; }
      if (leftSide.userNotification.isRead > rightSide.userNotification.isRead) { return 1; }

      return 0;
    });
  }

  private sortCurrentUserNoitficationByCreationDateDesc() {
    this.currentUserNotifications.sort((leftSide, rightSide): number => {
      if (leftSide.userNotification.creatonDate > rightSide.userNotification.creatonDate) { return -1; }
      if (leftSide.userNotification.creatonDate < rightSide.userNotification.creatonDate) { return 1; }

      return 0;
    });
  }

  private unsubscribeEvents() {
    if (this.userNotificationAllViewSubscription !== undefined) {
      this.userNotificationAllViewSubscription.unsubscribe();
    }
    if (this.allNotificationInAllViewSubscription !== undefined) {
      this.allNotificationInAllViewSubscription.unsubscribe();
    }
  }
}
