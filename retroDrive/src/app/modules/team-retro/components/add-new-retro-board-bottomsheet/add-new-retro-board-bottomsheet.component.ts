import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Teams } from 'src/app/models/teams';

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

  teams: Teams[];

  membersList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddNewRetroBoardBottomsheetComponent>,
    private formBuilder: FormBuilder,
    private frbs: FirestoreRetroBoardService) { }

  ngOnInit() {
    this.createAddNewRetroBoardForm();
    this.prepareTeams();
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

  onChangeTeams(eventValue) {
    if (eventValue !== null) {
      this.shouldDisableMembersControl = false;
    }
  }

  createNewRetroBoard() {
    this.prepareRetroBoardToSave();

    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  private prepareRetroBoardToSave() {
    const value = this.addNewRetroBoardForm.value;
    const retroBoard = {
      sprintName: value.sprintName,
      retroName: value.retroName,
      team: value.teamsFormControl,
      members: value.membersFormControl
    };
    this.frbs.addNewRetroBoard(retroBoard);
  }

  private prepareTeams() {
    this.teams = new Array<Teams>();
    this.frbs.getTeams().then(snapshotTeams => {
      snapshotTeams.docs.forEach(doc => {
        const team: Teams = {
          id: doc.id,
          name: doc.data().name
        };
        this.teams.push(team);
      });
    });
  }

}
