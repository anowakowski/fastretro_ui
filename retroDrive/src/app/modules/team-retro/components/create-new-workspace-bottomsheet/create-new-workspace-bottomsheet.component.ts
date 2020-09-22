import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { formatDate } from '@angular/common';
import { Workspace } from 'src/app/models/workspace';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';

@Component({
  selector: 'app-create-new-workspace-bottomsheet',
  templateUrl: './create-new-workspace-bottomsheet.component.html',
  styleUrls: ['./create-new-workspace-bottomsheet.component.css']
})
export class CreateNewWorkspaceBottomsheetComponent implements OnInit {

  addNewWorkspaceForm: FormGroup;
  workspaceNameFormControl = new FormControl('', Validators.required);

  constructor(
    private bottomSheetRef: MatBottomSheetRef<CreateNewWorkspaceBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private formBuilder: FormBuilder,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserApiService: CurrentUserApiService) { }

  ngOnInit() {
    this.createNewWorkspaceForm();
  }

  createNewWorkspaceForm() {
    this.addNewWorkspaceForm = this.formBuilder.group({
      workspaceNameFormControl: this.workspaceNameFormControl,
    });
  }

  createNewWorkspace() {
    const teamNameValue = this.addNewWorkspaceForm.value.workspaceNameFormControl;
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');

  }
}
