import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { formatDate } from '@angular/common';
import { Workspace } from 'src/app/models/workspace';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

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

  ngOnInit() {
    this.createNewWorkspaceForm();
    this.clearLocalStorage();
  }

  createNewWorkspaceForm() {
    this.addNewWorkspaceForm = this.formBuilder.group({
      workspaceNameFormControl: this.workspaceNameFormControl,
    });
  }

  createNewWorkspace() {
    const workspaceNameValue = this.addNewWorkspaceForm.value.workspaceNameFormControl;

    if (this.addNewWorkspaceForm.valid) {
      this.shouldValidateWorkspaceName = true;
      this.validateIfWorkspaceIsCurrentlyInUse(workspaceNameValue);
      const currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');
    }
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
}
