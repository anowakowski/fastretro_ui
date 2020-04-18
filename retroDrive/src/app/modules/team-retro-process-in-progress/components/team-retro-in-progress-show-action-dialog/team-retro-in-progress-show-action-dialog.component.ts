import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';

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
  actions: RetroBoardCardActions[];

  ngOnInit() {
    this.prepareActions();
    this.createActionForRetroBoardForm();
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

    this.firestoreService.deleteRetroBoardCardAction(action.id);
    const retroBoardToUpdate = this.prepareRetroBoardCardToUpdate(this.dataRetroBoardCard, actionIds);
    this.firestoreService.updateRetroBoardCard(retroBoardToUpdate, this.dataRetroBoardCard.id);
  }

  private prepareRetroBoardCardToUpdate(card: RetroBoardCard, actionsToUpdate: any[]) {
    return {
      actions: actionsToUpdate
    };
  }

  closeEditAction(action: RetroBoardCardActions) {
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

  private createActionForRetroBoardForm() {
    this.addNewActionForRetroBoardCardForm = this.formBuilder.group({
      actionTextAreaFormControl: this.actionTextAreaFormControl,
    });
  }

  private prepareActions() {
    this.actions = new Array<RetroBoardCardActions>();
    this.dataRetroBoardCard.actions.forEach(action => {
      action.get().then(actionSnapshot => {
        const retroBoardCardAction = actionSnapshot.data() as RetroBoardCardActions;
        const docId = actionSnapshot.id;
        retroBoardCardAction.id = docId;
        this.actions.push(retroBoardCardAction);
      });
    });
  }
}
