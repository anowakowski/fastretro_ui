import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-team-retro-in-progress-show-action-dialog',
  templateUrl: './team-retro-in-progress-show-action-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-action-dialog.component.css']
})
export class TeamRetroInProgressShowActionDialogComponent implements OnInit {
  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataRetroBoardCard: RetroBoardCard,
    private firestoreService: FiresrtoreRetroProcessInProgressService,
    private formBuilder: FormBuilder) { }

  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  actions: any[];

  ngOnInit() {
    this.prepareActions();
    this.createActionForRetroBoardForm();
  }

  editAction(action) {
    this.actionTextAreaFormControl.setValue(action.actionText);
    action.isEdit = true;
  }

  deleteAction(action) {
    const findedAction = this.actions.find(x => x.actionId === action.actionId);
    const indexOfArray = this.actions.indexOf(findedAction);
    this.actions.splice(indexOfArray, 1);

    this.firestoreService.deleteRetroBoardCardAction(action.actionId);
    const retroBoardToUpdate = this.prepareRetroBoardCardToUpdate(this.dataRetroBoardCard, this.actions);
    this.firestoreService.updateRetroBoardCard(retroBoardToUpdate, this.dataRetroBoardCard.id);
  }

  private prepareRetroBoardCardToUpdate(card: RetroBoardCard, actionsToUpdate: any[]) {
    return {
      name: card.name,
      isEdit: card.isEdit,
      index: card.index,
      isNewItem: card.isNewItem,
      isMerged: card.isMerged,
      isWentWellRetroBoradCol: card.isWentWellRetroBoradCol,
      mergedContent: card.mergedContent,
      voteCount: card.voteCount,
      actions: actionsToUpdate
    };
  }

  closeEditAction(action) {
    this.actionTextAreaFormControl.reset();
    action.isEdit = false;
  }

  updateActionFromEdit(action) {
    const textValue = this.addNewActionForRetroBoardCardForm.value.actionTextAreaFormControl;
    action.isEdit = false;
    action.actionText = textValue;

    const currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');

    const retroBoardCardActionToSave = {
      text: textValue,
      creationDate: currentDate,
    };

    this.firestoreService.updateRetroBoardCardAction(retroBoardCardActionToSave, action.actionId);
  }

  private createActionForRetroBoardForm() {
    this.addNewActionForRetroBoardCardForm = this.formBuilder.group({
      actionTextAreaFormControl: this.actionTextAreaFormControl,
    });
  }

  private prepareActions() {
    this.actions = new Array<any>();
    this.dataRetroBoardCard.actions.forEach(action => {
      action.get().then(actionSnapshot => {
        const actionData = actionSnapshot.data();
        this.actions.push({
          actionText: actionData.text,
          actionId: actionSnapshot.id,
          creationDate: actionData.creationDate,
          retroBoardCard: action.retroBoardCard,
          isEdit: false});
      });
    });
  }
}
