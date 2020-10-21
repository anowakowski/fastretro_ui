import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from 'src/app/models/team';
import { Workspace } from 'src/app/models/workspace';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { User } from 'src/app/models/user';
import { UserNotificationWorkspaceWithRequiredAccess } from 'src/app/models/userNotificationWorkspaceWithRequiredAccess';
import { UserWorkspaceDataToSave } from 'src/app/models/userWorkspaceDataToSave';
import { EventsService } from 'src/app/services/events.service';
import { formatDate } from '@angular/common';
import { FirestoreRetroBoardService } from 'src/app/modules/team-retro/services/firestore-retro-board.service';
import { UserNotification } from 'src/app/models/userNotification';

@Component({
  selector: 'app-user-notification-details-dialog',
  templateUrl: './user-notification-details-dialog.component.html',
  styleUrls: ['./user-notification-details-dialog.component.css']
})

export class UserNotificationDetailsDialogComponent implements OnInit {
  private readonly workspaceWithRequiredAccessName = 'WorkspaceWithRequiredAccess';
  private readonly workspaceWithRequiredAccessResponseName = 'WorkspaceWithRequiredAccessResponse';

  currentUser: User;
  userNotificationWorkspaceWithRequiredAccess: UserNotificationWorkspaceWithRequiredAccess;
  isApprovedRequest: boolean;
  newUserNotification: UserNotification;

  constructor(
    public dialogRef: MatDialogRef<UserNotificationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserApiService: CurrentUserApiService,
    private eventsService: EventsService
  ) {}

  ngOnInit() {
    this.currentUser = this.data.currentUser as User;
    this.userNotificationWorkspaceWithRequiredAccess =
      this.data.userNotificationWorkspaceWithRequiredAccess as UserNotificationWorkspaceWithRequiredAccess;
    this.newUserNotification = this.data.newUserNotification as UserNotification;
    this.setNotificationContentToDisplay();
  }

  setNotificationAsRead() {
    this.currentUserApiService.setUserNotificationAsRead(
      this.userNotificationWorkspaceWithRequiredAccess.userWantToJoinFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.creatorUserFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.workspceWithRequiredAccessFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.userWaitingToApproveWorkspaceJoinId
    )
    .then(() => {
      this.eventsService.emitSetRefreshNotificationEmiter();
    })
    .catch(error => {
      const err = error;
    });
  }

  isNotificationForApproval() {
    // tslint:disable-next-line:max-line-length
    return this.userNotificationWorkspaceWithRequiredAccess.userNotification.notyficationType === this.workspaceWithRequiredAccessName;
  }

  getIsUserApprovedRequest() {
    this.currentUserApiService.getUserWaitingToApproveWorkspaceJoin(
      this.userNotificationWorkspaceWithRequiredAccess.userWantToJoinFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.creatorUserFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.workspceWithRequiredAccessFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.userWaitingToApproveWorkspaceJoinId
    )
    .then(response => {
      if (response !== undefined && response !== null) {
        this.isApprovedRequest = response.isApprovalByCreator;
      }
    })
    .catch(error => {
      const err = error;
    });
  }

  approveUserWantToJoinToWorkspace() {
    const requestIsApprove = true;
    this.currentUserApiService.setApproveUserWantToJoinToWorkspace(
      this.userNotificationWorkspaceWithRequiredAccess.userWantToJoinFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.creatorUserFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.workspceWithRequiredAccessFirebaseId,
      requestIsApprove
      )
      .then(() => {
        this.addToUserWorkspaces(
          this.userNotificationWorkspaceWithRequiredAccess.userWantToJoinFirebaseId,
          this.userNotificationWorkspaceWithRequiredAccess.workspceWithRequiredAccessFirebaseId);
      })
      .catch(error => {
        const err = error;
      });
  }

  rejectUserWantToJoinToWorkspace() {
    const requestIsApprove = false;
    this.currentUserApiService.setApproveUserWantToJoinToWorkspace(
      this.userNotificationWorkspaceWithRequiredAccess.userWantToJoinFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.creatorUserFirebaseId,
      this.userNotificationWorkspaceWithRequiredAccess.workspceWithRequiredAccessFirebaseId,
      requestIsApprove
      )
      .then(() => {
        this.setUserNotificationForuserWaitingToApproveWorkspaceJoin();
      })
      .catch(error => {
        const err = error;
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  isAceptedByOwnerAndIsApproved(): boolean {
    const isAccpeted =
    this.userNotificationWorkspaceWithRequiredAccess.userWaitingToApproveWorkspaceJoin.isApprovalByCreator &&
    this.userNotificationWorkspaceWithRequiredAccess.userWaitingToApproveWorkspaceJoin.requestIsApprove;

    return isAccpeted;
  }

  private addToUserWorkspaces(userId: string, workspaceId: string) {
    this.firestoreService.getUserWorkspace(userId).then(userWorkspaceSnapshot => {
      const workspacesToAddToUserWorkspace: UserWorkspaceDataToSave = {
        workspace: this.firestoreService.addWorkspaceAsRef(workspaceId),
        isCurrent: false
      };
      const findedUserWorkspace = userWorkspaceSnapshot.docs[0].data() as UserWorkspaceToSave;
      const findedUserWorkspaceId = userWorkspaceSnapshot.docs[0].id as string;
      findedUserWorkspace.workspaces.push(workspacesToAddToUserWorkspace);
      this.firestoreService.updateUserWorkspaces(findedUserWorkspace, findedUserWorkspaceId);
      this.setUserNotificationForuserWaitingToApproveWorkspaceJoin();
    });
  }

  private setUserNotificationForuserWaitingToApproveWorkspaceJoin() {
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    const usrNotificationToSave = {
      creationDate: currentDate,
      userId: this.userNotificationWorkspaceWithRequiredAccess.userWantToJoinFirebaseId
    };
    this.firestoreService.addNewUserNotification(usrNotificationToSave).then(userNotificationSnapshot => {
      const userNotificationDocId = userNotificationSnapshot.id;
      this.setUserNotificationForuserWaitingToApproveWorkspaceJoinInApi(userNotificationDocId);
    });
  }

  private setUserNotificationForuserWaitingToApproveWorkspaceJoinInApi(userNotificationDocId) {
    this.currentUserApiService
      .setUserNotificationForuserWaitingToApproveWorkspaceJoin(
        this.userNotificationWorkspaceWithRequiredAccess.userWaitingToApproveWorkspaceJoinId,
        userNotificationDocId
      )
      .then(() => {
        this.dialogRef.close();
       })
      .catch(error => {
        const err = error;
      });
  }

  private setNewUserNotificationAsRead() {
    this.currentUserApiService.setNewUserNotificationAsRead(
      this.newUserNotification.id
    )
    .then(() => {
      this.eventsService.emitSetRefreshNotificationEmiter();
    })
    .catch(error => {
      const err = error;
    });
  }

  private setNotificationContentToDisplay() {
    if (this.userNotificationWorkspaceWithRequiredAccess.userNotification.notyficationType === this.workspaceWithRequiredAccessName) {
      this.getIsUserApprovedRequest();
      this.setNotificationAsRead();
    } else if (this.userNotificationWorkspaceWithRequiredAccess.userNotification.notyficationType ===
        this.workspaceWithRequiredAccessResponseName) {
          this.currentUserApiService.setUserNotificationAsReadForWorkspaceWithRequiredAccessResponse(
            this.userNotificationWorkspaceWithRequiredAccess.userNotification.id
          )
          .then(() => {
            this.eventsService.emitSetRefreshNotificationEmiter();
          })
          .catch(error => {
            const err = error;
          });
    } else if (this.newUserNotification) {
      this.setNewUserNotificationAsRead();
    }
  }
}
