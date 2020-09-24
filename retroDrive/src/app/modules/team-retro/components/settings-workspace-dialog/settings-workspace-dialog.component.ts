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
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';
import { WorkspaceToUpdateWorkspaceName } from 'src/app/models/workspaceToUpdateWorkspaceName';

@Component({
  selector: 'app-settings-workspace-dialog',
  templateUrl: './settings-workspace-dialog.component.html',
  styleUrls: ['./settings-workspace-dialog.component.css']
})
export class SettingsWorkspaceDialogComponent implements OnInit {

  editExisitngWorkspaceForm: FormGroup;
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
    this.createForm();
  }

  onNoClick(): void {
    this.dialogRef.close({shouldRefreshTeams: false});
  }


  onSaveEditedWorkspace() {
    if (this.editExisitngWorkspaceForm.valid) {
      const workspaceName = this.editExisitngWorkspaceForm.value.existingWorkspaceNameFormControl;

      this.firestoreService.findWorkspacesByName(workspaceName)
        .then(workpsaceSnapshot => {
          if (!workpsaceSnapshot.empty) {
            // tslint:disable-next-line:object-literal-key-quotes
            this.existingWorkspaceNameFormControl.setErrors({'workspacenameinuse': true});
          } else {
            const workspace: WorkspaceToUpdateWorkspaceName = this.prepareWorkspaceModel(workspaceName);
            const workspaceId = workpsaceSnapshot.docs[0].id as string;
            this.firestoreService.updateWorkspacesName(workspace, workspaceId);
          }
        });
    }
  }

  private prepareWorkspaceModel(workspaceName: any): WorkspaceToUpdateWorkspaceName {
    return {
      name: workspaceName,
    };
  }

  private createForm() {
    this.editExisitngWorkspaceForm = this.formBuilder.group({
      existingWorkspaceNameFormControl: this.existingWorkspaceNameFormControl,
    });
  }
}
