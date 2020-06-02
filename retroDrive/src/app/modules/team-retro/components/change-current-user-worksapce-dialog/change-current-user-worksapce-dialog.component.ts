import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from 'src/app/models/team';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Workspace } from 'src/app/models/workspace';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { UserWorkspace } from 'src/app/models/userWorkspace';

@Component({
  selector: 'app-change-current-user-worksapce-dialog',
  templateUrl: './change-current-user-worksapce-dialog.component.html',
  styleUrls: ['./change-current-user-worksapce-dialog.component.css']
})
export class ChangeCurrentUserWorksapceDialogComponent implements OnInit {

  changeCurrentUserWorkspaceForm: FormGroup;
  changeCurrentUserWorkspaceFormControl = new FormControl('');

  dataIsLoading = true;
  userWorkspace: UserWorkspace;

  constructor(
    public dialogRef: MatDialogRef<ChangeCurrentUserWorksapceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.createActionForRetroBoardForm();
    this.userWorkspace = this.data.userWorkspaces;
  }

  changeUserWorkspace() {
    const chosenWorkspaceId = this.changeCurrentUserWorkspaceForm.value.changeCurrentUserWorkspaceFormControl;

    this.firestoreService.findUserWorkspacesById(this.userWorkspace.id).then(userWorkspaceSnapshot => {
      const findedUserWorkspace = userWorkspaceSnapshot.data() as UserWorkspaceToSave;
      const userWorkspaceId = userWorkspaceSnapshot.id;

      this.changeUserWorkspaceIsCurrentState(findedUserWorkspace, userWorkspaceId);
      const findedUserWorkspaceToUpdate = findedUserWorkspace.workspaces.find(uw => uw.workspace.id === chosenWorkspaceId);

      findedUserWorkspaceToUpdate.isCurrent = true;
      this.firestoreService.updateUserWorkspaces(findedUserWorkspace, userWorkspaceId);
    });
  }

  private changeUserWorkspaceIsCurrentState(findedUserWorkspace: UserWorkspaceToSave, userWorkspaceId: string) {
    const findedCurrentWorkspaceDataToChange = findedUserWorkspace.workspaces.find(uw => uw.isCurrent);
    findedCurrentWorkspaceDataToChange.isCurrent = false;
    this.firestoreService.updateUserWorkspaces(findedUserWorkspace, userWorkspaceId);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private createActionForRetroBoardForm() {
    this.changeCurrentUserWorkspaceForm = this.formBuilder.group({
      changeCurrentUserWorkspaceFormControl: this.changeCurrentUserWorkspaceFormControl,
    });
  }
}
