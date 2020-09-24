import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from 'src/app/models/team';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Workspace } from 'src/app/models/workspace';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { User } from 'src/app/models/user';
import { UserWorkspaceDataToSave } from 'src/app/models/userWorkspaceDataToSave';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { UserWorkspaceData } from 'src/app/models/userWorkspaceData';
import { LocalStorageService } from 'src/app/services/local-storage.service';

import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { UserNotificationToSave } from 'src/app/models/UserNotificationToSave';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RetroBoardSnackbarComponent } from '../retro-board-snackbar/retro-board-snackbar.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-settings-workspace-dialog',
  templateUrl: './settings-workspace-dialog.component.html',
  styleUrls: ['./settings-workspace-dialog.component.css']
})
export class SettingsWorkspaceDialogComponent implements OnInit {

  joinToExisitngWorkspaceForm: FormGroup;
  existingWorkspaceNameFormControl = new FormControl('', Validators.required);

  workspaceNotExist = false;

  constructor(
    public dialogRef: MatDialogRef<SettingsWorkspaceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.createActionForRetroBoardForm();
  }

  joinToExisitngWorkspace() {
    if (this.joinToExisitngWorkspaceForm.valid) {
      const workspaceName = this.joinToExisitngWorkspaceForm.value.existingWorkspaceNameFormControl;

      this.firestoreService.findWorkspacesByName(workspaceName).then(workspaceSnapshot => {
        if (workspaceSnapshot.docs.length === 0) {
          // tslint:disable-next-line:object-literal-key-quotes
          this.existingWorkspaceNameFormControl.setErrors({'notexists': true});
        } else {
          const findedWorkspaceDoc = workspaceSnapshot.docs[0];
          const workspaceId = findedWorkspaceDoc.id;
          const findedWorkspace = findedWorkspaceDoc.data();
          // this.createUserWorkspaces(this.data.currentUser, workspaceId);
          if (!findedWorkspace.isWithRequireAccess) {
            this.addToUserWorkspaces(this.data.currentUser, workspaceId, this.data.userWorkspace);
          } else {
            this.currentUserInRetroBoardApiService.getIsExistingUserWaitingToApproveWorkspace( this.data.currentUser.uid, workspaceId)
              .then(response => {
                const isExistingWaitingToApprovalWorkspace = response;
                if (isExistingWaitingToApprovalWorkspace !== null && isExistingWaitingToApprovalWorkspace !== undefined) {
                  if (isExistingWaitingToApprovalWorkspace) {
                    this.openSnackbar('you are currently send request to join for this workspace');
                  } else {
                    this.setNotification(findedWorkspace, workspaceId, workspaceName);
                  }
                }
              })
              .catch(error => {
                const err = error;
              });
          }
        }
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close({shouldRefreshTeams: false});
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

  private setNotification(findedWorkspace, workspaceId: string, workspaceName: any) {
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    const usrNotificationToSave = {creationDate: currentDate, userId: findedWorkspace.creatorUserId};
    this.firestoreService.addNewUserNotification(usrNotificationToSave).then(userNotificationSnapshot => {
      const userNotificationDocId = userNotificationSnapshot.id;
      this.setUserNotificationInCurrentUserApi(findedWorkspace, workspaceId, workspaceName, userNotificationDocId);
    });
  }

  private setUserNotificationInCurrentUserApi(
    findedWorkspace: any,
    workspaceId: string,
    workspaceName: any,
    userNotificationDocId: string) {
    const userNotyfication: UserNotificationToSave =
      this.prepareUserNotification(findedWorkspace, workspaceId, workspaceName, userNotificationDocId);
    this.currentUserInRetroBoardApiService.setUserNotification(userNotyfication)
      .then(() => {
        this.openSnackbar('This Workspace Require Access By Owner');
        this.dialogRef.close({
          shouldRefreshTeams: false,
          shouldShowRequestForWorkspaceWithRequiredAccess: true,
          workspaceWithRequiredAccessId: workspaceId
        });
      })
      .catch(error => {
        const err = error;
      });
  }

  private prepareUserNotification(
    findedWorkspace,
    workspaceId: string,
    workspaceName: any,
    userNotificationFirebaseDocId: string): UserNotificationToSave {
    return {
      userWantToJoinFirebaseId: this.data.currentUser.uid,
      creatorUserFirebaseId: findedWorkspace.creatorUserId,
      workspceWithRequiredAccessFirebaseId: workspaceId,
      workspaceName,
      displayName: this.data.currentUser.displayName,
      email: this.data.currentUser.email,
      userNotificationFirebaseDocId
    };
  }

  private addToUserWorkspaces(findedUsr: User, workspaceIdToAdd: string, userWorkspace: UserWorkspace) {
    this.firestoreService.findUserWorkspacesById(userWorkspace.id).then(userWorkspaceSnapshot => {
      const findedUserWorkspace = userWorkspaceSnapshot.data() as UserWorkspaceToSave;
      const userWorkspaceId = userWorkspaceSnapshot.id;

      const workspaces = findedUserWorkspace.workspaces;
      const checkIfUserIsJoinedToWorkspace = workspaces.some(x => x.workspace.id === workspaceIdToAdd);

      if (checkIfUserIsJoinedToWorkspace) {
        // tslint:disable-next-line:object-literal-key-quotes
        this.existingWorkspaceNameFormControl.setErrors({'userisjoinedtoworkspace': true});
      } else {
        this.changeUserWorkspaceIsCurrentState(findedUserWorkspace, userWorkspaceId);
        this.addNewUserWorkspaceAsCurrent(workspaceIdToAdd, findedUserWorkspace, userWorkspaceId);
      }
    });
  }

  private changeUserWorkspaceIsCurrentState(findedUserWorkspace: UserWorkspaceToSave, userWorkspaceId: string) {
    const findedCurrentWorkspaceDataToChange = findedUserWorkspace.workspaces.find(uw => uw.isCurrent);
    findedCurrentWorkspaceDataToChange.isCurrent = false;
    this.firestoreService.updateUserWorkspaces(findedUserWorkspace, userWorkspaceId);
  }

  private addNewUserWorkspaceAsCurrent(workspaceId: string, findedUserWorkspace: UserWorkspaceToSave, userWorkspaceId: string) {
    const userWorkspaceDataToSave: UserWorkspaceDataToSave = {
      isCurrent: true,
      workspace: this.firestoreService.addWorkspaceAsRef(workspaceId)
    };
    findedUserWorkspace.workspaces.push(userWorkspaceDataToSave);
    this.firestoreService.updateUserWorkspaces(findedUserWorkspace, userWorkspaceId).then(() => {
      this.dialogRef.close({
        workspaceId,
        shouldRefreshTeams: true
      });
    });
  }

  private createActionForRetroBoardForm() {
    this.joinToExisitngWorkspaceForm = this.formBuilder.group({
      existingWorkspaceNameFormControl: this.existingWorkspaceNameFormControl,
    });
  }
}
