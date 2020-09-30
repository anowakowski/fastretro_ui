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
import { WorkspaceToUpdateWorkspace } from 'src/app/models/workspaceToUpdateWorkspace';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-user-settings-dialog',
  templateUrl: './user-settings-dialog.component.html',
  styleUrls: ['./user-settings-dialog.component.css']
})
export class UserSettingsDialogComponent implements OnInit {

  editExisitngWorkspaceForm: FormGroup;
  existingWorkspaceNameFormControl = new FormControl('', [Validators.required, Validators.maxLength(70)]);

  workspaceNotExist = false;
  currentWorkspace: Workspace;

  selectedIsRequiredAccess = false;

  constructor(
    public dialogRef: MatDialogRef<UserSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.createForm();
    this.currentWorkspace = this.data.currentWorkspace as Workspace;
    this.existingWorkspaceNameFormControl.setValue(this.currentWorkspace.name);
    this.selectedIsRequiredAccess = this.currentWorkspace.isWithRequireAccess;
  }

  onNoClick(): void {
    this.dialogRef.close({shouldRefreshTeams: false});
  }

  onSaveEditedWorkspace() {
    if (this.editExisitngWorkspaceForm.valid) {
      const workspaceName = this.editExisitngWorkspaceForm.value.existingWorkspaceNameFormControl;

      this.firestoreService.findWorkspacesByName(workspaceName)
        .then(workpsaceSnapshot => {
          if (!workpsaceSnapshot.empty && this.currentWorkspace.isWithRequireAccess === this.selectedIsRequiredAccess) {
            // tslint:disable-next-line:object-literal-key-quotes
            this.existingWorkspaceNameFormControl.setErrors({'workspacenameinuse': true});
          } else {
            const workspace: WorkspaceToUpdateWorkspace = this.prepareWorkspaceModel(workspaceName);
            this.firestoreService.updateWorkspacesName(workspace, this.currentWorkspace.id)
              .then(() => {
                this.dialogRef.close({
                  workspaceId: this.currentWorkspace.id,
                  shouldRefreshTeams: true
                });
              });
          }
        });
    }
  }

  onChangeSlideToggle(eventValue: MatSlideToggleChange) {
    this.selectedIsRequiredAccess = eventValue.checked;
  }

  private prepareWorkspaceModel(workspaceName: any): WorkspaceToUpdateWorkspace {
    return {
      name: workspaceName,
      isWithRequireAccess: this.selectedIsRequiredAccess
    };
  }

  private createForm() {
    this.editExisitngWorkspaceForm = this.formBuilder.group({
      existingWorkspaceNameFormControl: this.existingWorkspaceNameFormControl,
    });
  }
}
