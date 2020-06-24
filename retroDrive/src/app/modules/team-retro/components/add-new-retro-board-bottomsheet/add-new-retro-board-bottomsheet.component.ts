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
import { RetroBoardAdditionalInfoToSave } from 'src/app/models/retroBoardAdditionalInfoToSave';

@Component({
  selector: 'app-add-new-retro-board-bottomsheet',
  templateUrl: './add-new-retro-board-bottomsheet.component.html',
  styleUrls: ['./add-new-retro-board-bottomsheet.component.css']
})
export class AddNewRetroBoardBottomsheetComponent implements OnInit {

  addNewRetroBoardForm: FormGroup;
  membersFormControl = new FormControl('');
  teamsFormControl = new FormControl('', Validators.required);
  retroName = new FormControl('', Validators.required);
  sprintNumber = new FormControl('', Validators.required);
  shouldDisableMembersControl = true;

  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;
  currentUser: User;

  teams: Teams[];

  membersList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  shouldBlurRetroBoardCard: boolean;
  hideVoutCountInretroBoardCard: boolean;
  selectedVouteCount = 6;

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

  onChangeSlider(eventValue) {
    this.selectedVouteCount = eventValue as number;
  }

  createNewRetroBoard() {
    this.tryParseSprintNumber();

    if (this.addNewRetroBoardForm.valid) {
      const retroBoardToSave = this.prepareRetroBoardToSave();
      this.frbs.addNewRetroBoard(retroBoardToSave).then(newRetroBoardSnapshot => {
        const newRetroBoardId = newRetroBoardSnapshot.id;
        this.prepareAddToCurrentUserInRetroBoard(newRetroBoardId);
        this.prepareBaseRetroBoardOptionsAndAdditionalInfo(newRetroBoardId);
      });

      this.bottomSheetRef.dismiss();
      event.preventDefault();
    }
  }

  private tryParseSprintNumber() {
    const sprintNumber = this.sprintNumber.value;
    // tslint:disable-next-line:radix
    const parsedNumber = parseInt(sprintNumber, 10);

    if (isNaN(parsedNumber)) {
      // tslint:disable-next-line:object-literal-key-quotes
      this.sprintNumber.setErrors({'sprintnumberisnotnumber': true});
    }
  }

  onChangeShouldBlurRetroBoardCard(event) {
    this.shouldBlurRetroBoardCard = event.checked;
  }

  onChangeHideVouteCountRetroBoardCard(event) {
    this.hideVoutCountInretroBoardCard = event.checked;
  }

  formatLabel(value: number) {
    this.selectedVouteCount = value;
    console.log(this.selectedVouteCount);
    return this.selectedVouteCount;
  }

  private prepareBaseRetroBoardOptionsAndAdditionalInfo(newRetroBoardId: string) {
    const retroBoardOptionsToSave: RetroBoardOptions = this.prepareRetroBoardOptionsToSave(newRetroBoardId);
    const retroBoardAdditionalInfo: RetroBoardAdditionalInfoToSave = this.prepareRetroBoardAdditionalInfo(newRetroBoardId);
    const retroBoardLastRetroBoard: any = {
      retroBoardFirebaseDocId: newRetroBoardId,
      teamFirebaseDocId: this.addNewRetroBoardForm.value.teamsFormControl.id,
      workspaceFirebaseDocId: this.currentWorkspace.id,
      isFinished: false,
      isStarted: false
    };

    if (this.currentUserApiService.isTokenExpired()) {
      this.currentUserApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserApiService.setRegeneratedToken(refreshedTokenResponse);
        this.setRetroBoardOptions(retroBoardOptionsToSave);
        this.setRetroBoardAdditionalInfo(retroBoardAdditionalInfo);
        this.setLastRetroBoard(retroBoardLastRetroBoard);
      });
    } else {
      this.setRetroBoardOptions(retroBoardOptionsToSave);
      this.setRetroBoardAdditionalInfo(retroBoardAdditionalInfo);
      this.setLastRetroBoard(retroBoardLastRetroBoard);
    }
  }
  private setLastRetroBoard(retroBoardLastRetroBoard: any) {
    this.currentUserApiService
      .setLastRetroBoard(
        retroBoardLastRetroBoard.retroBoardFirebaseDocId,
        retroBoardLastRetroBoard.teamFirebaseDocId,
        retroBoardLastRetroBoard.workspaceFirebaseDocId,
        retroBoardLastRetroBoard.isFinished,
        retroBoardLastRetroBoard.isStarted)
        .then(() => {})
        .catch(error => {
          const err = error;
        });
  }

  private setRetroBoardAdditionalInfo(retroBoardAdditionalInfo: RetroBoardAdditionalInfoToSave) {
    this.currentUserApiService.setRetroBoardAdditionalInfo(retroBoardAdditionalInfo).then(() => {})
    .catch(error => {
      const err = error;
    });
  }

  private prepareRetroBoardAdditionalInfo(newRetroBoardId: string): RetroBoardAdditionalInfoToSave {
    return {
      retroBoardFirebaseDocId: newRetroBoardId,
      teamFirebaseDocId: this.addNewRetroBoardForm.value.teamsFormControl.id,
      workspaceFirebaseDocId: this.currentWorkspace.id
    };
  }

  private prepareRetroBoardOptionsToSave(newRetroBoardId: string): RetroBoardOptions {
    return {
      retroBoardFirebaseDocId: newRetroBoardId,
      maxVouteCount: this.selectedVouteCount,
      shouldBlurRetroBoardCardText: this.shouldBlurRetroBoardCard,
      shouldHideVoutCountInRetroBoardCard: this.hideVoutCountInretroBoardCard
    };
  }

  private setRetroBoardOptions(retroBoardOptionsToSave: RetroBoardOptions) {
    this.currentUserApiService.setRetroBoardOptions(retroBoardOptionsToSave).then(() => { })
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
