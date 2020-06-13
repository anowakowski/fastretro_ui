import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { UsersInTeams } from 'src/app/models/usersInTeams';

@Component({
  selector: 'app-team-retro-in-progress-show-previous-actions-dialog',
  templateUrl: './team-retro-in-progress-show-previous-actions-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-previous-actions-dialog.component.css']
})
export class TeamRetroInProgressShowPreviousActionsDialogComponent implements OnInit {
  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('');
  retroBoardCardsWithActions = new Array<RetroBoardCard>();

  addUserToActionForm: FormGroup;
  usersInTeamFormControl = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowPreviousActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FiresrtoreRetroProcessInProgressService,
    private formBuilder: FormBuilder,
    private currentUserApiService: CurrentUserApiService
  ) { }

  simpleRetroBoardCards: any[];
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  actions: RetroBoardCardActions[];

  usersInTeams: UsersInTeams[] = new Array<UsersInTeams>();
  usersInTeamValueSelected: any;

  retroBoardCards = new Array<RetroBoardCard>();

  ngOnInit() {
    if (this.data != null) {
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
                }
            });
          }
        });

      }
    }
    this.createActionForRetroBoardForm();
    this.createAddUserToActionForm();
  }

  private prepareRetroBoardWithAction() {
    const fliteredRetroBoardCard = this.retroBoardCards.filter(rtb => rtb.actions.some(a => a));
    fliteredRetroBoardCard.forEach(retroBoardCard => {
      this.retroBoardCardsWithActions.push(retroBoardCard);
    });
  }

  usersInTeamsChange(event) {
    const isChosenUsersInTeam = !event;
    if (isChosenUsersInTeam) {
      this.usersInTeamValueSelected = this.usersInTeamFormControl.value;
    }
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
    // const retroBoardToUpdate = this.prepareRetroBoardCardToUpdate(this.dataRetroBoardCard, actionIds);
    // this.firestoreService.updateRetroBoardCard(retroBoardToUpdate, this.dataRetroBoardCard.id);
  }

  copyCardWithActionToCurrentRetroBoardFromPrevious(retroBoardCad, action) {

  }

  closeEditAction(action: any) {
    this.actionTextAreaFormControl.reset();
    action.isEdit = false;
  }

  updateActionFromEdit(action: RetroBoardCardActions) {
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
      usersInTeamFormControl: this.usersInTeamFormControl
    });
  }

  private prepareSimpleCartAndActionsActions() {
    this.simpleRetroBoardCards = new Array<any>();
    this.retroBoardCardsWithActions.forEach(retroBoardCard => {
      const simpleCardToAdd: any = {};
      simpleCardToAdd.name = retroBoardCard.name;
      simpleCardToAdd.actions = new Array<RetroBoardCardActions>();

      retroBoardCard.actions.forEach(action => {
        action.get().then(actionSnapshot => {
          const retroBoardCardAction = actionSnapshot.data() as RetroBoardCardActions;
          if (retroBoardCardAction !== undefined) {
            const docId = actionSnapshot.id;
            retroBoardCardAction.isEdit = false;
            retroBoardCardAction.id = docId;
            simpleCardToAdd.actions.push(retroBoardCardAction);
          }
        });
      });
      this.simpleRetroBoardCards.push(simpleCardToAdd);
    });
  }

  private getArrayIndex(findedRetroBoardCard: RetroBoardCard, array: any[]) {
  }
}
