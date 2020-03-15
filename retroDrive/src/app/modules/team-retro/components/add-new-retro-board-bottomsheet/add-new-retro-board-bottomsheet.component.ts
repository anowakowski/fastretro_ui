import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-add-new-retro-board-bottomsheet',
  templateUrl: './add-new-retro-board-bottomsheet.component.html',
  styleUrls: ['./add-new-retro-board-bottomsheet.component.css']
})
export class AddNewRetroBoardBottomsheetComponent implements OnInit {

  addNewRetroBoardForm: FormGroup;
  membersFormControl = new FormControl('');
  teamsFormControl = new FormControl('');
  retroName = new FormControl('');
  sprintName = new FormControl('');
  shouldDisableMembersControl = true;

  membersList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  constructor(private bottomSheetRef: MatBottomSheetRef<AddNewRetroBoardBottomsheetComponent>, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createAddNewRetroBoardForm();
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  createAddNewRetroBoardForm() {
    this.addNewRetroBoardForm = this.formBuilder.group({
      retroName: this.retroName,
      membersFormControl: this.membersFormControl,
      sprintName: this.sprintName,
      teamsFormControl: this.teamsFormControl
    });
  }

  createNewRetroBoard() {
    const value = this.addNewRetroBoardForm.value;

    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  onChangeTeams(eventValue) {
    if (eventValue !== null){
      this.shouldDisableMembersControl = false;
    }
  }

}
