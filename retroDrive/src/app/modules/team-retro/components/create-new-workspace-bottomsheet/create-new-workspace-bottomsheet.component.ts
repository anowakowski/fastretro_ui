import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { formatDate } from '@angular/common';
import { Workspace } from 'src/app/models/workspace';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserWorkspaceDataToSave } from 'src/app/models/userWorkspaceDataToSave';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { UserWorkspace } from 'src/app/models/userWorkspace';

@Component({
  selector: 'app-create-new-workspace-bottomsheet',
  templateUrl: './create-new-workspace-bottomsheet.component.html',
  styleUrls: ['./create-new-workspace-bottomsheet.component.css']
})
export class CreateNewWorkspaceBottomsheetComponent implements OnInit {

  constructor(
    private bottomSheetRef: MatBottomSheetRef<CreateNewWorkspaceBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private formBuilder: FormBuilder,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserApiService: CurrentUserApiService,
    private localStorageService: LocalStorageService) { }

  addNewWorkspaceForm: FormGroup;
  workspaceNameFormControl = new FormControl('', Validators.required);

  shouldValidateWorkspaceName;
  selectedIsRequiredAccess;

  ngOnInit() {
    this.createNewWorkspaceForm();
    this.clearLocalStorage();
  }

  createNewWorkspaceForm() {
    this.addNewWorkspaceForm = this.formBuilder.group({
      workspaceNameFormControl: this.workspaceNameFormControl,
    });
  }

  onCreateNewWorkspace() {
    const workspaceNameValue = this.addNewWorkspaceForm.value.workspaceNameFormControl;

    if (this.addNewWorkspaceForm.valid) {
      this.shouldValidateWorkspaceName = true;
      this.validateIfWorkspaceIsCurrentlyInUse(workspaceNameValue);

      this.createWorkspaceProcess(this.data.currentUser);
    }
  }

  onChangeSlideToggle(eventValue: MatSlideToggleChange) {
    this.selectedIsRequiredAccess = eventValue.checked;
  }

  private validateIfWorkspaceIsCurrentlyInUse(workspaceName: any) {
    this.firestoreService.findWorkspacesByName(workspaceName).then(workspaceSnapshot => {
      if (workspaceSnapshot.docs.length > 0) {
        this.processingValidationWhenWorkspaceExists();
      }
    });
  }

  private processingValidationWhenWorkspaceExists() {
    this.clearLocalStorage();
    this.localStorageService.setItem('shouldShowWithWorkspaceExists', true);

    this.workspaceNameFormControl.updateValueAndValidity();
  }

  private clearLocalStorage() {
    this.localStorageService.removeItem('shouldShowWithWorkspaceExists');
  }

  private createWorkspaceProcess(user: User) {
    const workspaceName = this.addNewWorkspaceForm.value.workspaceNameFormControl;
    const workspace: WorkspaceToSave = this.prepareWorkspaceModel(workspaceName, user.uid);

    this.firestoreService.addNewWorkspace(workspace)
      .then(() => {
        this.createUserWorkspaces(workspaceName);
      });
  }

  private prepareWorkspaceModel(workspaceName: any, createrUserId: string): WorkspaceToSave {
    return {
      name: workspaceName,
      isNewWorkspace: true,
      isWithRequireAccess: this.selectedIsRequiredAccess,
      creatorUserId: createrUserId,
      creationDate: formatDate(new Date(), 'yyyy/MM/dd', 'en')
    };
  }

  private createUserWorkspaces(workspaceName: string) {
    this.firestoreService.findWorkspacesByName(workspaceName).then(workspaceSnapshot => {
      if (workspaceSnapshot.docs.length === 0) {

      } else {
        const findedWorkspaceDoc = workspaceSnapshot.docs[0];
        const workspaceId = findedWorkspaceDoc.id;

        this.addToUserWorkspaces(workspaceId, this.data.userWorkspace);
      }
    });
  }

  private addToUserWorkspaces(workspaceIdToAdd: string, userWorkspace: UserWorkspace) {
    this.firestoreService.findUserWorkspacesById(userWorkspace.id).then(userWorkspaceSnapshot => {
      const findedUserWorkspace = userWorkspaceSnapshot.data() as UserWorkspaceToSave;
      const userWorkspaceId = userWorkspaceSnapshot.id;

      this.changeUserWorkspaceIsCurrentState(findedUserWorkspace, userWorkspaceId);
      this.addNewUserWorkspaceWithSettingAsCurrent(workspaceIdToAdd, findedUserWorkspace, userWorkspaceId);
    });
  }

  private changeUserWorkspaceIsCurrentState(findedUserWorkspace: UserWorkspaceToSave, userWorkspaceId: string) {
    const findedCurrentWorkspaceDataToChange = findedUserWorkspace.workspaces.find(uw => uw.isCurrent);
    findedCurrentWorkspaceDataToChange.isCurrent = false;
    this.firestoreService.updateUserWorkspaces(findedUserWorkspace, userWorkspaceId);
  }

  private addNewUserWorkspaceWithSettingAsCurrent(workspaceId: string, findedUserWorkspace: UserWorkspaceToSave, userWorkspaceId: string) {
    const userWorkspaceDataToSave: UserWorkspaceDataToSave = {
      isCurrent: true,
      workspace: this.firestoreService.addWorkspaceAsRef(workspaceId)
    };
    findedUserWorkspace.workspaces.push(userWorkspaceDataToSave);
    this.firestoreService.updateUserWorkspaces(findedUserWorkspace, userWorkspaceId)
      .then(() => {
        this.bottomSheetRef.dismiss({
          workspaceId,
          shouldRefreshTeams: true
        });
      });
  }
}
