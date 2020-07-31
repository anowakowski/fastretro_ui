import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { RetroBoardAdditionalInfoToSave } from 'src/app/models/retroBoardAdditionalInfoToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { UsersInTeams } from 'src/app/models/usersInTeams';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-team-retro-in-progress-show-all-actions-dialog',
  templateUrl: './team-retro-in-progress-show-all-actions-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-all-actions-dialog.component.css']
})
export class TeamRetroInProgressShowAllActionsDialogComponent implements OnInit {
  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('', Validators.maxLength(150));
  dataRetroBoardCards: RetroBoardCard[];

  addUserToActionForm: FormGroup;
  usersInTeamFormControl = new FormControl();
  usersInAction: any[];
  isCreatedOneOfDyncamicActionForm: boolean;

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowAllActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FiresrtoreRetroProcessInProgressService,
    private formBuilder: FormBuilder,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    private excelService: ExcelService
  ) { }

  simpleRetroBoardCards: any[];
  actions: RetroBoardCardActions[];

  usersInTeams: UsersInTeams[] = new Array<UsersInTeams>();
  usersInActionsIds: string[] = new Array<string>();
  usersInTeamValueSelected: any;

  ngOnInit() {
    this.dataRetroBoardCards = this.data.retroBoardCardToShow;

    this.currentUserInRetroBoardApiService.getUsersInTeam(this.data.workspaceId, this.data.teamId).then(response => {
      if (response !== undefined && response !== null) {
        const usersInTeamsResponse = response;
        usersInTeamsResponse.forEach(usrsInTeam => {
          const usersInTeam: UsersInTeams = {
            userFirebaseDocId: usrsInTeam.userFirebaseDocId,
            displayName: usrsInTeam.chosenAvatarUrl,
            chosenAvatarUrl: usrsInTeam.displayName,
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

    this.prepareSimpleCartAndActionsActions();
    this.prepareActions();
    this.createActionForRetroBoardForm();
    this.createAddUserToActionForm();
  }

  closeClick(): void {
    this.dialogRef.close();
  }

  editAction(action: any) {
    this.actionTextAreaFormControl.setValue(action.text);
    action.isEdit = true;
  }

  deleteAction(action: any,  simpleRetroBoardCard: any) {
    const findedRetroBoardCardToUpdate = this.dataRetroBoardCards.find(rb => rb.id === simpleRetroBoardCard.id);
    const findedAction = findedRetroBoardCardToUpdate.actions.find(x => x.id === action.id);
    const indexOfArray = findedRetroBoardCardToUpdate.actions.indexOf(findedAction);
    findedRetroBoardCardToUpdate.actions.splice(indexOfArray, 1);

    const findedSimpleRetroBoardCardToUpdate = this.simpleRetroBoardCards.find(rb => rb.id === findedRetroBoardCardToUpdate.id);
    const findedSimpleAction = findedSimpleRetroBoardCardToUpdate.actions.find(x => x.id === action.id);
    const indexOfArrayForSimpleActions = findedSimpleRetroBoardCardToUpdate.actions.indexOf(findedSimpleAction);
    findedSimpleRetroBoardCardToUpdate.actions.splice(indexOfArrayForSimpleActions, 1);

    const actionIds = findedRetroBoardCardToUpdate.actions.map(x => this.firestoreService.addRetroBoardCardActionAsRef(x.id));

    this.firestoreService.deleteRetroBoardCardAction(action.id).then(() => {
      const retroBoardToUpdate = this.prepareRetroBoardCardToUpdate(findedRetroBoardCardToUpdate, actionIds);
      this.firestoreService.updateRetroBoardCard(retroBoardToUpdate, simpleRetroBoardCard.id);

      this.addFreshActualCountOfRetroBoardActions();
    });
  }

  closeEditAction(action: any) {
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

  shouldShowDivider(currentRetroBoardCard) {
    const currentRetroBoardIndex = this.dataRetroBoardCards.indexOf(currentRetroBoardCard);
    const retroBoardCardCount = this.dataRetroBoardCards.length;

    if (currentRetroBoardIndex === retroBoardCardCount) {}
  }

  usersInTeamsChange(event, simpleRetroBoardCard: any, action: any) {
    const isChosenUsersInTeam = !event;
    if (isChosenUsersInTeam) {
      const actionName = action.actionNameForFormControl;
      const selectedUserInTeams = this.addUserToActionForm.get(actionName).value as UsersInTeams[];
      const selectedUsersInTeamsIds = new Array<string>();
      selectedUserInTeams.forEach(usr => selectedUsersInTeamsIds.push(usr.userFirebaseDocId));

      this.usersInTeamValueSelected = selectedUsersInTeamsIds;
      this.setUserInActionInApi(simpleRetroBoardCard, action);
    }
  }

  changeActionIsSolved(event, simpleRetroBoardCard: any, action: any) {
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

    this.excelService.exportAsExcelFile(cardWithActionToSaveAsExcel, 'allRetroBoardAction');
  }

  private prepareExcelData(cardWithActionToSaveAsExcel: any[]) {
    this.simpleRetroBoardCards.forEach(simpleCard => {
      simpleCard.actions.forEach((action: { text: any; }) => {
        const cardWithActionToExcel = {
          cardTitle: simpleCard.name,
          actionText: action.text
        };

        cardWithActionToSaveAsExcel.push(cardWithActionToExcel);
      });
    });
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

  private setCurrentUsersInActionsWithFormControl() {
    if (this.isCreatedOneOfDyncamicActionForm) {
      const mapedUserInActionsRBCardIds = this.usersInAction.map(ua => ua.retroBoardCardFirebaseDocId);
      const setUsersInActionWithoutRepetsRBCardDocIds = new Set();
      mapedUserInActionsRBCardIds.forEach(mua => setUsersInActionWithoutRepetsRBCardDocIds.add(mua));

      setUsersInActionWithoutRepetsRBCardDocIds.forEach(rbCardId => {
        const filteredUserInAction = this.usersInAction.filter(ua => ua.retroBoardCardFirebaseDocId === rbCardId);
        const mappedUserInActionsRBActionsIds = filteredUserInAction.map(fua => fua.retroBoardActionCardFirebaseDocId);
        const setUserInActionWithoutRepetsRBCActionDocIds = new Set();
        mappedUserInActionsRBActionsIds.forEach(muaa => setUserInActionWithoutRepetsRBCActionDocIds.add(muaa));

        setUserInActionWithoutRepetsRBCActionDocIds.forEach(rbActionId => {
          const filteredUsersInAction = this.usersInAction.filter(ua => ua.retroBoardActionCardFirebaseDocId === rbActionId);
          const findedSimpleCard = this.simpleRetroBoardCards.find(sc => sc.id === rbCardId);
          const findedAction = findedSimpleCard.actions.find(a => a.id === rbActionId);

          const actionName = findedAction.actionNameForFormControl;
          const filteredUserInTeamsToAdd = new Array<UsersInTeams>();

          filteredUsersInAction
            .forEach(ua => filteredUserInTeamsToAdd.push(this.usersInTeams.find(ut => ut.userFirebaseDocId === ua.userFirebaseDocId)));

          this.addUserToActionForm.get(actionName).setValue(filteredUserInTeamsToAdd);
        });
      });
    }
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

  private prepareSimpleCartAndActionsActions() {
    this.simpleRetroBoardCards = new Array<any>();
    const actionBaseNameForFormControl = 'action';
    let actionForDynamicNameOfFormControlIndex = 0;
    this.dataRetroBoardCards.forEach(retroBoardCard => {
      const simpleCardToAdd: any = {};
      simpleCardToAdd.name = retroBoardCard.name;
      simpleCardToAdd.actions = new Array<RetroBoardCardActions>();
      simpleCardToAdd.id = retroBoardCard.id;

      retroBoardCard.actions.forEach(action => {
        action.get().then(actionSnapshot => {
          const retroBoardCardAction = actionSnapshot.data();
          if (retroBoardCardAction !== undefined) {
            const docId = actionSnapshot.id;
            retroBoardCardAction.isEdit = false;
            retroBoardCardAction.id = docId;
            const actionName = actionBaseNameForFormControl + actionForDynamicNameOfFormControlIndex.toString();
            retroBoardCardAction.actionNameForFormControl = actionName;

            this.prepareDyncamicFormControlForAction(actionName);
            simpleCardToAdd.actions.push(retroBoardCardAction);

            this.setCurrentUsersInActionWithFormControl(actionName, retroBoardCardAction.id);

            actionForDynamicNameOfFormControlIndex++;
          }
        });
      });
      this.simpleRetroBoardCards.push(simpleCardToAdd);
    });
  }

  private prepareDyncamicFormControlForAction(actionName: string) {
    this.addUserToActionForm.setControl(actionName, new FormControl());
    this.isCreatedOneOfDyncamicActionForm = true;
  }

  private prepareActions() {
    this.actions = new Array<RetroBoardCardActions>();
    this.dataRetroBoardCards.forEach(dataRetroBoardCard => {
      dataRetroBoardCard.actions.forEach(action => {
        action.get().then(actionSnapshot => {
          const retroBoardCardAction = actionSnapshot.data() as RetroBoardCardActions;
          const docId = actionSnapshot.id;
          retroBoardCardAction.id = docId;
          this.actions.push(retroBoardCardAction);
        });
      });
    });
  }
}
