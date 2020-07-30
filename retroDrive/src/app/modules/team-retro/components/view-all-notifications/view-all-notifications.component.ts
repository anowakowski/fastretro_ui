import { Component, OnInit } from '@angular/core';
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
export class ViewAllNotificationsComponent implements OnInit {

  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;
  public currentUserNotifications = new Array<UserNotificationWorkspaceWithRequiredAccess>();

  constructor(
    public auth: AuthService,
    private localStorageService: LocalStorageService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    private firestoreService: FirestoreRetroBoardService,
    public dialog: MatDialog,
    private eventsService: EventsService,
    private snackBar: MatSnackBar) { }

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

  openSnackbar(displayText) {
    const durationInSeconds = 5;
    this.snackBar.openFromComponent(RetroBoardSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        shouldShowWarningMessage: false,
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
        this.addToUserWorkspaces(userNotification);
      })
      .catch(error => {
        const err = error;
      });
  }

  private addToUserWorkspaces(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    this.firestoreService.getUserWorkspace(userNotification.userWantToJoinFirebaseId).then(userWorkspaceSnapshot => {
      const workspacesToAddToUserWorkspace: UserWorkspaceDataToSave = {
        workspace: this.firestoreService.addWorkspaceAsRef(userNotification.workspceWithRequiredAccessFirebaseId),
        isCurrent: false
      };
      const findedUserWorkspace = userWorkspaceSnapshot.docs[0].data() as UserWorkspaceToSave;
      const findedUserWorkspaceId = userWorkspaceSnapshot.docs[0].id as string;
      findedUserWorkspace.workspaces.push(workspacesToAddToUserWorkspace);
      this.firestoreService.updateUserWorkspaces(findedUserWorkspace, findedUserWorkspaceId);
      this.setUserNotificationForuserWaitingToApproveWorkspaceJoin(userNotification);
    });
  }

  private setUserNotificationForuserWaitingToApproveWorkspaceJoin(userNotification: UserNotificationWorkspaceWithRequiredAccess) {
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    const usrNotificationToSave = {
      creationDate: currentDate,
      userId: userNotification.userWantToJoinFirebaseId
    };
    this.firestoreService.addNewUserNotification(usrNotificationToSave).then(userNotificationSnapshot => {
      const userNotificationDocId = userNotificationSnapshot.id;
      this.setUserNotificationForuserWaitingToApproveWorkspaceJoinInApi(userNotification, userNotificationDocId);
    });
  }

  private setUserNotificationForuserWaitingToApproveWorkspaceJoinInApi(
    userNotification: UserNotificationWorkspaceWithRequiredAccess,
    userNotificationDocId) {
      this.currentUserInRetroBoardApiService
        .setUserNotificationForuserWaitingToApproveWorkspaceJoin(
          userNotification.userWaitingToApproveWorkspaceJoinId,
          userNotificationDocId
        )
        .then(() => {
          this.openSnackbar('you accpeted request');
          this.getUserNotification();
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
        this.setUserNotificationForuserWaitingToApproveWorkspaceJoin(userNotification);
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
    if (this.currentUserNotifications.length > 10) {
      this.eventsService.emitSetAllRetroBoardBackgroudnNoMoreHigherEmiter();
    } else {
      this.eventsService.emitSetAllRetroBoardBackgroudnMoreHigherEmiter();
    }
    this.sortCurrentUserNoitficationByCreationDateDesc();
    this.sortCurrentUserNoitficationByIsReadByAsc();
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
