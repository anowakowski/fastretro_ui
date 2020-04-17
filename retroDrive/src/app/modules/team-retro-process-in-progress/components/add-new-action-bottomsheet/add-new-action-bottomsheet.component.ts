import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';

@Component({
  selector: 'app-add-new-action-bottomsheet',
  templateUrl: './add-new-action-bottomsheet.component.html',
  styleUrls: ['./add-new-action-bottomsheet.component.css']
})
export class AddNewActionBottomsheetComponent implements OnInit {

  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('');

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddNewActionBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private formBuilder: FormBuilder,
    private firestoreService: FiresrtoreRetroProcessInProgressService) { }

  currentCard: RetroBoardCard;

  ngOnInit() {
    this.currentCard = this.data as RetroBoardCard;
    this.createActionForRetroBoardForm();
  }

  createActionForRetroBoardForm() {
    this.addNewActionForRetroBoardCardForm = this.formBuilder.group({
      actionTextAreaFormControl: this.actionTextAreaFormControl,
    });
  }

  createNewRetroBoardCardAction() {
    const actionTextValue = this.addNewActionForRetroBoardCardForm.value.actionTextAreaFormControl;

    const retroBoardCardActionToSave = {
      text: actionTextValue,
      retroBoardCard: this.firestoreService.addRetroBoardAsRef(this.currentCard.id)
    };

    this.firestoreService.addNewRetroBoardCardAction(retroBoardCardActionToSave).then(retroBoardCardActionSnapshot => {
      retroBoardCardActionSnapshot.get().then(retroBoardCardActionDoc => {
        const retroBoardCardActionId = retroBoardCardActionDoc.id;
        const retroBoardCardToUpdate = this.prepareRetroBoardCardToUpdate(this.currentCard, retroBoardCardActionId);
        this.firestoreService.updateRetroBoardCard(retroBoardCardToUpdate, this.currentCard.id);

        this.bottomSheetRef.dismiss();
        event.preventDefault();
      });
    });
  }

  private prepareRetroBoardCardToUpdate(card: RetroBoardCard, actionId: any) {

    const cardToUpdate = {
      name: card.name,
      isEdit: card.isEdit,
      index: card.index,
      isNewItem: card.isNewItem,
      isMerged: card.isMerged,
      isWentWellRetroBoradCol: card.isWentWellRetroBoradCol,
      mergedContent: card.mergedContent,
      voteCount: card.voteCount,
      actions: card.actions
    };

    if (!cardToUpdate.actions) {
      cardToUpdate.actions = new Array<any>();
    }

    this.prepareNewActionToCard(actionId, cardToUpdate);

    return cardToUpdate;
  }

  private prepareNewActionToCard(actionId: any, cardToUpdate: any) {
    const actionRef = this.firestoreService.addRetroBoardCardActionAsRef(actionId);
    cardToUpdate.actions.push(actionRef);
  }
}
