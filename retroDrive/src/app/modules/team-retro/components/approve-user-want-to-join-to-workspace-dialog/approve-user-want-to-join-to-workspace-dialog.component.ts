import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from 'src/app/models/team';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Workspace } from 'src/app/models/workspace';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { User } from 'src/app/models/user';
import { UserNotificationWorkspaceWithRequiredAccess } from 'src/app/models/userNotificationWorkspaceWithRequiredAccess';
import { UserWorkspaceDataToSave } from 'src/app/models/userWorkspaceDataToSave';

@Component({
  selector: 'app-approve-user-want-to-join-to-workspace-dialog',
  templateUrl: './approve-user-want-to-join-to-workspace-dialog.component.html',
  styleUrls: ['./approve-user-want-to-join-to-workspace-dialog.component.css']
})

export class ApproveUserWantToJoinToWorkspaceDialogComponent implements OnInit {
  private readonly workspaceWithRequiredAccessName = 'WorkspaceWithRequiredAccess';
  private readonly workspaceWithRequiredAccessResponseName = 'WorkspaceWithRequiredAccessResponse';

  currentUser: User;
  userNotificationWorkspaceWithRequiredAccess: UserNotificationWorkspaceWithRequiredAccess;
  isApprovedRequest: boolean;

  constructor(
    public dialogRef: MatDialogRef<ApproveUserWantToJoinToWorkspaceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserApiService: CurrentUserApiService
  ) {}

  ngOnInit() {
    this.currentUser = this.data.currentUser as User;
    this.userNotificationWorkspaceWithRequiredAccess =
      this.data.userNotificationWorkspaceWithRequiredAccess as UserNotificationWorkspaceWithRequiredAccess;
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
        this.dialogRef.close();
      })
      .catch(error => {
        const err = error;
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
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
      this.dialogRef.close();
    });
  }

  private setUserNotificationForuserWaitingToApproveWorkspaceJoin() {
    this.currentUserApiService
      .setUserNotificationForuserWaitingToApproveWorkspaceJoin(
        this.userNotificationWorkspaceWithRequiredAccess.userWaitingToApproveWorkspaceJoinId)
      .then(() => {
        // add usr notification to refresh
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
          .then(() => {})
          .catch(error => {
            const err = error;
          });
    }
  }
}
