import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { RetroBoardAdditionalInfoToSave } from 'src/app/models/retroBoardAdditionalInfoToSave';
import { UsersInTeams } from 'src/app/models/usersInTeams';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-team-retro-in-progress-show-action-dialog',
  templateUrl: './team-retro-in-progress-show-action-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-action-dialog.component.css']
})
export class TeamRetroInProgressShowActionDialogComponent implements OnInit {
  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('', Validators.maxLength(150));
  dataRetroBoardCard: RetroBoardCard;

  addUserToActionForm: FormGroup;
  usersInTeamFormControl = new FormControl();
  usersInAction: any[];
  isCreatedOneOfDyncamicActionForm: boolean;

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FiresrtoreRetroProcessInProgressService,
    private formBuilder: FormBuilder,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    private excelService: ExcelService) { }

  actions: any[];
  usersInTeamValueSelected: any;
  usersInTeams: UsersInTeams[] = new Array<UsersInTeams>();

  ngOnInit() {
    this.dataRetroBoardCard = this.data.currentCard as RetroBoardCard;

    this.currentUserInRetroBoardApiService.getUsersInTeam(this.data.workspaceId, this.data.teamId).then(response => {
      if (response !== undefined && response !== null) {
        const usersInTeamsResponse = response;
        usersInTeamsResponse.forEach(usrsInTeam => {
          const usersInTeam: UsersInTeams = {
            userFirebaseDocId: usrsInTeam.userFirebaseDocId,
            displayName: usrsInTeam.chosenAvatarName,
            chosenAvatarName: usrsInTeam.displayName,
            teamFirebaseDocId: usrsInTeam.teamFirebaseDocId,
            workspaceFirebaseDocId: usrsInTeam.workspaceFirebaseDocId
          };
          this.usersInTeams.push(usrsInTeam);
        });

        this.currentUserInRetroBoardApiService.getUsersInActionInTeam(this.data.workspaceId, this.data.teamId)
          .then(userInActionResponse => {
            if (userInActionResponse !== null && userInActionResponse !== undefined) {
              if (userInActionResponse.length > 0) {
                this.usersInAction = userInActionResponse;
                this.setCurrentUsersInActionsWithFormControl();
              }
            }
          })
          .catch(error => {
            const err = error;
          });
        }
    });

    this.prepareActions();
    this.createActionForRetroBoardForm();
    this.createAddUserToActionForm();
  }

  closeClick(): void {
    this.dialogRef.close();
  }

  editAction(action: RetroBoardCardActions) {
    this.actionTextAreaFormControl.setValue(action.text);
    action.isEdit = true;
  }

  deleteAction(action: RetroBoardCardActions) {
    const findedAction = this.actions.find(x => x.id === action.id);
    const indexOfArray = this.actions.indexOf(findedAction);
    this.actions.splice(indexOfArray, 1);
    const actionIds = this.actions.map(x => this.firestoreService.addRetroBoardCardActionAsRef(x.id));

    this.firestoreService.deleteRetroBoardCardAction(action.id).then(() => {
      const retroBoardToUpdate = this.prepareRetroBoardCardToUpdate(this.dataRetroBoardCard, actionIds);
      this.firestoreService.updateRetroBoardCard(retroBoardToUpdate, this.dataRetroBoardCard.id);

      this.addFreshActualCountOfRetroBoardActions();
    });

  }

  changeActionIsSolved(event, action: any) {
    const actionIsSolved = event.checked;

    const retroBoardCardActionToSave = {
      actionIsSolved
    };

    if (actionIsSolved !== undefined) {
      this.firestoreService.updateRetroBoardCardAction(retroBoardCardActionToSave, action.id);
    }
  }

  saveAsExcel() {
    const cardWithActionToSaveAsExcel = new Array();
    this.prepareExcelData(cardWithActionToSaveAsExcel);

    this.excelService.exportAsExcelFile(cardWithActionToSaveAsExcel, 'retroBoardActions');
  }

  private prepareExcelData(cardWithActionToSaveAsExcel: any[]) {
    this.actions.forEach(action => {
      const cardWithActionToExcel = {
        retroBoardName: this.data.retroBoardName,
        teamName: this.data.teamName,
        cardType: this.prepareCardType(this.dataRetroBoardCard),
        cardTitle: this.dataRetroBoardCard.name,
        actionText: action.text
      };
      cardWithActionToSaveAsExcel.push(cardWithActionToExcel);
    });
  }

  private prepareCardType(retroBoardCard: any) {
    if (retroBoardCard.isWentWellRetroBoradCol) {
      return 'Went Well';
    } else {
      return 'To Improve';
    }
  }

  private addFreshActualCountOfRetroBoardActions() {
    this.firestoreService.retroBoardCardActionsFilteredByRetroBoardId(this.data.retroBoardId)
      .then(retroBoardActionSnapshot => {
        const countOfRetroBoardActions = retroBoardActionSnapshot.docs.length;
        const retroBoardAdditionalInfo: RetroBoardAdditionalInfoToSave = {
          retroBoardFirebaseDocId: this.data.retroBoardId,
          teamFirebaseDocId: this.data.teamId,
          workspaceFirebaseDocId: this.data.workspaceId
        };
        this.currentUserInRetroBoardApiService
          .addRetroBoardAdditionalInfoWithActionCount(countOfRetroBoardActions, retroBoardAdditionalInfo)
          .then(() => { })
          .catch(error => {
            const err = error;
          });
      });
  }

  usersInTeamsChange(event, action: any) {
    const isChosenUsersInTeam = !event;
    if (isChosenUsersInTeam) {
      const actionName = action.actionNameForFormControl;
      const selectedUserInTeams = this.addUserToActionForm.get(actionName).value as UsersInTeams[];
      const selectedUsersInTeamsIds = new Array<string>();
      selectedUserInTeams.forEach(usr => selectedUsersInTeamsIds.push(usr.userFirebaseDocId));

      this.usersInTeamValueSelected = selectedUsersInTeamsIds;
      this.setUserInActionInApi(this.dataRetroBoardCard, action);
    }
  }

  closeEditAction(action: RetroBoardCardActions) {
    this.actionTextAreaFormControl.reset();
    action.isEdit = false;
  }

  updateActionFromEdit(action: RetroBoardCardActions) {
    if (this.addNewActionForRetroBoardCardForm.valid) {
      const textValue = this.addNewActionForRetroBoardCardForm.value.actionTextAreaFormControl;
      action.isEdit = false;
      action.text = textValue;

      const currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');

      const retroBoardCardActionToSave = {
        text: textValue,
        creationDate: currentDate,
      };

      this.firestoreService.updateRetroBoardCardAction(retroBoardCardActionToSave, action.id);
    }
  }

  private setUserInActionInApi(simpleRetroBoardCard: any, action: any) {
    this.currentUserInRetroBoardApiService.setUsersInAction(
      this.usersInTeamValueSelected,
      this.data.teamId,
      this.data.workspaceId,
      simpleRetroBoardCard.id,
      action.id)
      .then(() => {})
      .catch(error => {
        const err = error;
      });
  }

  private prepareRetroBoardCardToUpdate(card: RetroBoardCard, actionsToUpdate: any[]) {
    return {
      actions: actionsToUpdate
    };
  }

  private createActionForRetroBoardForm() {
    this.addNewActionForRetroBoardCardForm = this.formBuilder.group({
      actionTextAreaFormControl: this.actionTextAreaFormControl,
    });
  }

  private createAddUserToActionForm() {
    this.addUserToActionForm = this.formBuilder.group({
      usersInTeamFormControl: [null]
    });
  }

  private setCurrentUsersInActionWithFormControl(actionName, retroBoardCardActionId) {
    if (this.usersInAction !== undefined) {
      const filteredUsersInAction = this.usersInAction.filter(x => x.retroBoardActionCardFirebaseDocId === retroBoardCardActionId);
      const filteredUserInTeamsToAdd = new Array<UsersInTeams>();

      filteredUsersInAction
        .forEach(ua => filteredUserInTeamsToAdd.push(this.usersInTeams.find(ut => ut.userFirebaseDocId === ua.userFirebaseDocId)));
      this.addUserToActionForm.get(actionName).setValue(filteredUserInTeamsToAdd);
    }
  }


  private setCurrentUsersInActionsWithFormControl() {
    if (this.isCreatedOneOfDyncamicActionForm) {
      const filteredUserInAction = this.usersInAction.filter(ua => ua.retroBoardCardFirebaseDocId === this.dataRetroBoardCard.id);
      const mappedUserInActionsRBActionsIds = filteredUserInAction.map(fua => fua.retroBoardActionCardFirebaseDocId);
      const setUserInActionWithoutRepetsRBCActionDocIds = new Set();
      mappedUserInActionsRBActionsIds.forEach(muaa => setUserInActionWithoutRepetsRBCActionDocIds.add(muaa));

      setUserInActionWithoutRepetsRBCActionDocIds.forEach(rbActionId => {
        const filteredUsersInAction = this.usersInAction.filter(ua => ua.retroBoardActionCardFirebaseDocId === rbActionId);
        const findedAction = this.actions.find(a => a.id === rbActionId);
        const actionName = findedAction.actionNameForFormControl;

        const filteredUserInTeamsToAdd = new Array<UsersInTeams>();
        filteredUsersInAction
          .forEach(ua => filteredUserInTeamsToAdd.push(this.usersInTeams.find(ut => ut.userFirebaseDocId === ua.userFirebaseDocId)));

        this.addUserToActionForm.get(actionName).setValue(filteredUserInTeamsToAdd);
      });
    }
  }

  private prepareActions() {
    this.actions = new Array<any>();
    const actionBaseNameForFormControl = 'action';
    let actionForDynamicNameOfFormControlIndex = 0;
    this.dataRetroBoardCard.actions.forEach(action => {
      action.get().then(actionSnapshot => {
        const retroBoardCardAction = actionSnapshot.data();
        const docId = actionSnapshot.id;
        retroBoardCardAction.id = docId;
        const actionName = actionBaseNameForFormControl + actionForDynamicNameOfFormControlIndex.toString();
        retroBoardCardAction.actionNameForFormControl = actionName;
        this.prepareDyncamicFormControlForAction(actionName);

        this.actions.push(retroBoardCardAction);

        this.setCurrentUsersInActionWithFormControl(actionName, retroBoardCardAction.id);

        actionForDynamicNameOfFormControlIndex++;
      });
    });
  }

  private prepareDyncamicFormControlForAction(actionName: string) {
    this.addUserToActionForm.setControl(actionName, new FormControl());
    this.isCreatedOneOfDyncamicActionForm = true;
  }
}
