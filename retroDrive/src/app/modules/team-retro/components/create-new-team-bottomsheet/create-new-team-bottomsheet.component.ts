import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
// tslint:disable-next-line:max-line-length
import { FiresrtoreRetroProcessInProgressService } from 'src/app/modules/team-retro-process-in-progress/services/firesrtore-retro-process-in-progress.service';
import { formatDate } from '@angular/common';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';

@Component({
  selector: 'app-create-new-team-bottomsheet',
  templateUrl: './create-new-team-bottomsheet.component.html',
  styleUrls: ['./create-new-team-bottomsheet.component.css']
})
export class CreateNewTeamBottomsheetComponent implements OnInit {

  addNewTeamForm: FormGroup;
  teamNameFormControl = new FormControl('');

  constructor(
    private bottomSheetRef: MatBottomSheetRef<CreateNewTeamBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: WorkspaceToSave,
    private formBuilder: FormBuilder,
    private firestoreService: FiresrtoreRetroProcessInProgressService) { }

  ngOnInit() {
    this.createNewTeamsForm();
  }

  createNewTeamsForm() {
    this.addNewTeamForm = this.formBuilder.group({
      actionTextAreaFormControl: this.teamNameFormControl,
    });
  }

  createNewTeam() {
    const teamNameValue = this.addNewTeamForm.value.teamNameFormControl;
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');

    const teamToSave = {
      name: teamNameValue,
      creationDate: currentDate,
      //workspace: this.firestoreService.addWorkspaceAsRef(data.id)
    };
    
  }


}
