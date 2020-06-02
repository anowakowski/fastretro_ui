import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from 'src/app/models/team';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Workspace } from 'src/app/models/workspace';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';

@Component({
  selector: 'app-join-to-existing-workspace-dialog',
  templateUrl: './join-to-existing-workspace-dialog.component.html',
  styleUrls: ['./join-to-existing-workspace-dialog.component.css']
})
export class JoinToExistingWorkspaceDialogComponent implements OnInit {

  joinToExisitngWorkspaceForm: FormGroup;
  existingWorkspaceNameFormControl = new FormControl('');

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
    const chosenTeamId = this.joinToExisitngWorkspaceForm.value.existingTeamIdFormControl;
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
