import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { UsersInTeams } from 'src/app/models/usersInTeams';
import { ThrowStmt } from '@angular/compiler';
import { RetroBoard } from 'src/app/models/retroBoard';
import { DataPassingService } from 'src/app/services/data-passing.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-retro-in-progress-show-previous-actions-dialog',
  templateUrl: './team-retro-in-progress-show-previous-actions-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-previous-actions-dialog.component.css']
})
export class TeamRetroInProgressShowPreviousActionsDialogComponent implements OnInit {
  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('', Validators.maxLength(150));
  retroBoardCardsWithActions = new Array<RetroBoardCard>();

  addUserToActionForm: FormGroup;
  usersInTeamFormControl = new FormControl();
  usersInAction: any[];
  isCreatedOneOfDyncamicActionForm: boolean;
  previousUrlParameterId: string;
  findedPreviousRetroBoard: RetroBoard;

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowPreviousActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FiresrtoreRetroProcessInProgressService,
    private formBuilder: FormBuilder,
    private currentUserApiService: CurrentUserApiService,
    private dataPassingService: DataPassingService,
    private router: Router
  ) { }

  simpleRetroBoardCards: any[];
  actions: RetroBoardCardActions[];

  usersInTeams: UsersInTeams[] = new Array<UsersInTeams>();
  usersInActionsIds: string[] = new Array<string>();
  usersInTeamValueSelected: any;

  retroBoardCards = new Array<RetroBoardCard>();

  ngOnInit() {
    if (this.data != null) {
      this.createActionForRetroBoardForm();
      this.createAddUserToActionForm();
      this.preparePreviousRetroBoard();

      if (this.data.previousRetroBoardToShowActionsDocId != null) {
        this.firestoreService.retroBoardCardsFilteredByRetroBoardId(this.data.previousRetroBoardToShowActionsDocId)
          .then(retroBoardCardsSnapshot => {
            if (retroBoardCardsSnapshot.docs.length > 0) {
              retroBoardCardsSnapshot.docs.forEach(retroBoardCardSnapshot => {
                const findedRetroBoardCard = retroBoardCardSnapshot.data() as RetroBoardCard;
                findedRetroBoardCard.id = retroBoardCardSnapshot.id as string;
                this.retroBoardCards.push(findedRetroBoardCard);
              });

              if (this.retroBoardCards.length > 0) {
                this.prepareRetroBoardWithAction();
                if (this.retroBoardCardsWithActions.length > 0) {
                  this.prepareSimpleCartAndActionsActions();
                }
              }

              this.currentUserApiService.getUsersInTeam(this.data.workspaceId, this.data.teamId).then(response => {
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

                  this.currentUserApiService.getUsersInActionInTeam(this.data.workspaceId, this.data.teamId)
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
            }
          });
      }
    }
  }

  preparePreviousRetroBoard() {
    this.firestoreService.findRetroBoardById(this.data.previousRetroBoardToShowActionsDocId).then(retroBoardSnapshot => {
      this.findedPreviousRetroBoard = retroBoardSnapshot.data() as RetroBoard;
      this.findedPreviousRetroBoard.id = retroBoardSnapshot.id as string;
      this.previousUrlParameterId = this.findedPreviousRetroBoard.urlParamId;
    });
  }

  onGoToPreviousRetroBoard() {
    this.dialogRef.close();
    this.dataPassingService.setData(this.previousUrlParameterId, this.findedPreviousRetroBoard);
    this.router.navigateByUrl('/retro-in-progress/' + this.previousUrlParameterId);
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

  private prepareRetroBoardWithAction() {
    const fliteredRetroBoardCard = this.retroBoardCards.filter(rtb => rtb.actions.some(a => a));
    fliteredRetroBoardCard.forEach(retroBoardCard => {
      this.retroBoardCardsWithActions.push(retroBoardCard);
    });
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

  private setUserInActionInApi(simpleRetroBoardCard: any, action: any) {
    this.currentUserApiService.setUsersInAction(
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

  closeClick(): void {
    this.dialogRef.close();
  }

  editAction(action: any) {
    this.actionTextAreaFormControl.setValue(action.text);
    action.isEdit = true;
  }

  deleteAction(action: any) {
    const findedAction = this.actions.find(x => x.id === action.id);
    const indexOfArray = this.actions.indexOf(findedAction);
    this.actions.splice(indexOfArray, 1);
    const actionIds = this.actions.map(x => this.firestoreService.addRetroBoardCardActionAsRef(x.id));

    this.firestoreService.deleteRetroBoardCardAction(action.id);
  }

  copyCardWithActionToCurrentRetroBoardFromPrevious(retroBoardCad, action) {

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
    const currentRetroBoardIndex = this.retroBoardCards.indexOf(currentRetroBoardCard);
    const retroBoardCardCount = this.retroBoardCards.length;

    if (currentRetroBoardIndex === retroBoardCardCount) {}
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

  private prepareSimpleCartAndActionsActions() {
    this.simpleRetroBoardCards = new Array<any>();
    const actionBaseNameForFormControl = 'action';
    let actionForDynamicNameOfFormControlIndex = 0;
    this.retroBoardCardsWithActions.forEach(retroBoardCard => {
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
}
