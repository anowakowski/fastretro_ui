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
          // this.createUserWorkspaces(this.data.currentUser, workspaceId);
          this.addToUserWorkspaces(this.data.currentUser, workspaceId);
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


  private addToUserWorkspaces(findedUsr: User, workspaceId: string) {
    this.firestoreService.findUserWorkspacesById(workspaceId).then(userWorkspaceSnapshot => {
      const findedUserWorkspace = userWorkspaceSnapshot.data() as UserWorkspaceToSave;
      const userWorkspaceId = userWorkspaceSnapshot.id;
      this.changeUserWorkspaceIsCurrentState(findedUserWorkspace, userWorkspaceId);
      this.addNewUserWorkspaceAsCurrent(workspaceId, findedUserWorkspace, userWorkspaceId);
      // this.prepareUserWorkspace(findedUserWorkspace);
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
    this.firestoreService.updateUserWorkspaces(findedUserWorkspace, userWorkspaceId);
  }

  // private prepareUserWorkspace(findedUserWorkspace) {
  //   const userWorkspace: UserWorkspace = this.createUserWorkspace(this.currentUser);
  //   this.firestoreService.getUserWorkspace(this.currentUser.uid).then(userWorksapcesSnapshot => {
  //     if (userWorksapcesSnapshot.docs.length > 0) {
  //       userWorksapcesSnapshot.docs.forEach(userWorkspaceDoc => {
  //         const findedUserWorkspaceToSave = userWorkspaceDoc.data();
  //         userWorkspace.id = userWorkspaceDoc.id;
  //         findedUserWorkspaceToSave.workspaces.forEach(worskspaceData => {
  //           worskspaceData.workspace.get().then(findedUserWorkspaceToSaveDoc => {
  //             const userWorkspacesData = findedUserWorkspaceToSaveDoc.data() as Workspace;
  //             userWorkspacesData.id = findedUserWorkspaceToSaveDoc.id;
  //             const userWorkspacesDataToAdd: UserWorkspaceData = {
  //               workspace: userWorkspacesData,
  //               isCurrent: worskspaceData.isCurrent
  //             };

  //             userWorkspace.workspaces.push(userWorkspacesDataToAdd);
  //             this.localStorageService.removeItem('userWorkspace');
  //             this.localStorageService.setItem('userWorkspace', userWorkspace);

  //             findedUserWorkspace.workspaces.find(uw => uw.isCurrent).workspace.get().then(currWokrspaceSnapshot => {
  //               const currentWorkspaceToAdd = currWokrspaceSnapshot.data() as Workspace;
  //               this.currentWorkspace = currentWorkspaceToAdd;
  //               this.eventsService.emitSetNewCurrentWorkspaceEmiter(this.currentWorkspace);
  //             });
  //           });
  //         });
  //       });
  //     }
  //   });
  // }  


  onNoClick(): void {
    this.dialogRef.close();
  }

  private createActionForRetroBoardForm() {
    this.joinToExisitngWorkspaceForm = this.formBuilder.group({
      existingWorkspaceNameFormControl: this.existingWorkspaceNameFormControl,
    });
  }
}
