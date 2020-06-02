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

@Component({
  selector: 'app-join-to-existing-workspace-dialog',
  templateUrl: './join-to-existing-workspace-dialog.component.html',
  styleUrls: ['./join-to-existing-workspace-dialog.component.css']
})
export class JoinToExistingWorkspaceDialogComponent implements OnInit {

  joinToExisitngWorkspaceForm: FormGroup;
  existingWorkspaceNameFormControl = new FormControl('', Validators.required);

  workspaceNotExist = false;

  constructor(
    public dialogRef: MatDialogRef<JoinToExistingWorkspaceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private formBuilder: FormBuilder
  ) {}

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
          const findedWorkspace = workspaceSnapshot.docs[0];
          const workspaceId = findedWorkspace.id;
          this.createUserWorkspaces(this.data.currentUser, workspaceId);
        }
      });
    }
  }

  private createUserWorkspaces(findedUsr: User, workspaceId: string) {
    const workspacesToAddToUserWorkspace: UserWorkspaceDataToSave = {
      workspace: this.firestoreService.addWorkspaceAsRef(workspaceId),
      isCurrent: true
    };
    const userWorkspace: UserWorkspaceToSave = {
      userId: findedUsr.uid,
      workspaces: [workspacesToAddToUserWorkspace]
    };
    this.firestoreService.addNewUserWorkspace(userWorkspace);
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  private createActionForRetroBoardForm() {
    this.joinToExisitngWorkspaceForm = this.formBuilder.group({
      existingWorkspaceNameFormControl: this.existingWorkspaceNameFormControl,
    });
  }
}
