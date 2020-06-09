import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { RetroBoardAdditionalInfoToSave } from 'src/app/models/retroBoardAdditionalInfoToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';

@Component({
  selector: 'app-team-retro-in-progress-show-all-actions-dialog',
  templateUrl: './team-retro-in-progress-show-all-actions-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-all-actions-dialog.component.css']
})
export class TeamRetroInProgressShowAllActionsDialogComponent implements OnInit {
  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('');
  dataRetroBoardCards: RetroBoardCard[];

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowAllActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FiresrtoreRetroProcessInProgressService,
    private formBuilder: FormBuilder,
    private currentUserInRetroBoardApiService: CurrentUserApiService
  ) { }

  simpleRetroBoardCards: any[];
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  actions: RetroBoardCardActions[];

  ngOnInit() {
    this.dataRetroBoardCards = this.data.retroBoardCardToShow;
    this.prepareSimpleCartAndActionsActions();
    this.prepareActions();
    this.createActionForRetroBoardForm();
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
    const currentRetroBoardIndex = this.dataRetroBoardCards.indexOf(currentRetroBoardCard);
    const retroBoardCardCount = this.dataRetroBoardCards.length;

    if (currentRetroBoardIndex === retroBoardCardCount) {}
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

  private createActionForRetroBoardForm() {
    this.addNewActionForRetroBoardCardForm = this.formBuilder.group({
      actionTextAreaFormControl: this.actionTextAreaFormControl,
    });
  }

  private prepareSimpleCartAndActionsActions() {
    this.simpleRetroBoardCards = new Array<any>();
    this.dataRetroBoardCards.forEach(dataRetroBoardCard => {
      const simpleCardToAdd: any = {};
      simpleCardToAdd.name = dataRetroBoardCard.name;
      simpleCardToAdd.id = dataRetroBoardCard.id;
      simpleCardToAdd.actions = new Array<RetroBoardCardActions>();
      dataRetroBoardCard.actions.forEach(action => {
        action.get().then(actionSnapshot => {
          const retroBoardCardAction = actionSnapshot.data() as RetroBoardCardActions;
          const docId = actionSnapshot.id;
          retroBoardCardAction.isEdit = false;
          retroBoardCardAction.id = docId;
          simpleCardToAdd.actions.push(retroBoardCardAction);
        });
      });
      this.simpleRetroBoardCards.push(simpleCardToAdd);
    });
  }

  private getArrayIndex(findedRetroBoardCard: RetroBoardCard, array: any[]) {
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
