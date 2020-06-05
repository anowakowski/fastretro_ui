import { Component, OnInit } from '@angular/core';
import {formatDate} from '@angular/common';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Teams } from 'src/app/models/teams';
import { RetroBoardToSave } from 'src/app/models/retroBoardToSave';

import { Guid } from 'guid-typescript';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Workspace } from 'src/app/models/workspace';
import { User } from 'src/app/models/user';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { CurrentUsersInRetroBoardToSave } from 'src/app/models/currentUsersInRetroBoardToSave';
import { UserInRetroBoardData } from 'src/app/models/userInRetroBoardData';
import { RetroBoardOptions } from 'src/app/models/retroBoardOptions';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';

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
  sprintNumber = new FormControl('');
  shouldDisableMembersControl = true;

  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;
  currentUser: User;

  teams: Teams[];

  membersList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  shouldBlurRetroBoardCard: boolean;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddNewRetroBoardBottomsheetComponent>,
    private formBuilder: FormBuilder,
    private frbs: FirestoreRetroBoardService,
    private localStorageService: LocalStorageService,
    private currentUserApiService: CurrentUserApiService) { }

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
    this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;

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
      // membersFormControl: this.membersFormControl,
      sprintNumber: this.sprintNumber,
      teamsFormControl: this.teamsFormControl
    });
  }

  onChangeTeams(eventValue) {
    if (eventValue !== null) {
      this.shouldDisableMembersControl = false;
    }
  }

  createNewRetroBoard() {
    const retroBoardToSave = this.prepareRetroBoardToSave();
    this.frbs.addNewRetroBoard(retroBoardToSave).then(newRetroBoardSnapshot => {
      const newRetroBoardId = newRetroBoardSnapshot.id;
      this.prepareAddToCurrentUserInRetroBoard(newRetroBoardId);
      this.prepareBaseAdditionsalOptions(newRetroBoardId);
    });

    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  onChangeShouldBlurRetroBoardCard(event) {
    this.shouldBlurRetroBoardCard = event.checked;
  }

  private prepareBaseAdditionsalOptions(newRetroBoardId: string) {
    const retroBoardOptionsToSave: RetroBoardOptions = {
      retroBoardFirebaseDocId: newRetroBoardId,
      maxVouteCount: 6,
      shouldBlurRetroBoardCardText: this.shouldBlurRetroBoardCard
    };

    this.currentUserApiService.SetRetroBoardOptions(retroBoardOptionsToSave).then(() => {})
    .catch(error => {
      const err = error;
    });
  }

  private prepareAddToCurrentUserInRetroBoard(newRetroBoardId: string) {
    const currentUserInRetroBoardToSave: CurrentUsersInRetroBoardToSave = {
      retroBoardId: newRetroBoardId,
      usersInRetroBoardData: new Array<UserInRetroBoardData>()
    };
    this.frbs.addToCurrentUserInRetroBoard(currentUserInRetroBoardToSave);
  }

  private prepareRetroBoardToSave() {
    const value = this.addNewRetroBoardForm.value;
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    const guid = Guid.create();

    const retroBoard = {
      sprintNumber: value.sprintNumber,
      retroName: value.retroName,
      team: value.teamsFormControl,
      isFinished: false,
      // members: value.membersFormControl,
      creationDate: currentDate,
      lastModifiedDate: currentDate,
      urlParamId: guid.toString(),
      workspaceId: this.currentWorkspace.id,
      retroBoardOptionsChangeDate: currentDate
    };

    return retroBoard;
  }

  private prepareTeams() {
    this.teams = new Array<Teams>();
    this.frbs.getTeamsFiltered(this.currentWorkspace.id).then(snapshotTeams => {
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
