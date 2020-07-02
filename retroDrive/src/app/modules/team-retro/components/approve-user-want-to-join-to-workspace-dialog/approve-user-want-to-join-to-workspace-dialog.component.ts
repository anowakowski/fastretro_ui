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

@Component({
  selector: 'app-approve-user-want-to-join-to-workspace-dialog',
  templateUrl: './approve-user-want-to-join-to-workspace-dialog.component.html',
  styleUrls: ['./approve-user-want-to-join-to-workspace-dialog.component.css']
})

export class ApproveUserWantToJoinToWorkspaceDialogComponent implements OnInit {
  currentUser: User;
  userNotificationWorkspaceWithRequiredAccess: any;


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
    console.log(this.data);
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
        this.dialogRef.close();
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
}
