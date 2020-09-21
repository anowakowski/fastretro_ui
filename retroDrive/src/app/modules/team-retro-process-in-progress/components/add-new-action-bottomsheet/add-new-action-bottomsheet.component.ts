import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { formatDate } from '@angular/common';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { RetroBoardAdditionalInfoToSave } from 'src/app/models/retroBoardAdditionalInfoToSave';
import { RetroBoardCardActionsApiAfterAddGetModel } from 'src/app/models/retroBoardCardActionsApiAfterAddGetModel';

@Component({
  selector: 'app-add-new-action-bottomsheet',
  templateUrl: './add-new-action-bottomsheet.component.html',
  styleUrls: ['./add-new-action-bottomsheet.component.css']
})
export class AddNewActionBottomsheetComponent implements OnInit {

  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('', Validators.maxLength(150));

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddNewActionBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private formBuilder: FormBuilder,
    private firestoreService: FiresrtoreRetroProcessInProgressService,
    private currentUserApiService: CurrentUserApiService) { }

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
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');

    const retroBoardCardActionToSave = {
      // text: actionTextValue,
      creationDate: currentDate,
      retroBoardCard: this.firestoreService.addRetroBoardAsRef(this.currentCard.id),
      retroBoardId: this.currentCard.retroBoardId,
      isWentWell: this.currentCard.isWentWellRetroBoradCol
    };

    this.firestoreService.addNewRetroBoardCardAction(retroBoardCardActionToSave).then(retroBoardCardActionSnapshot => {
      retroBoardCardActionSnapshot.get().then(retroBoardCardActionDoc => {
        const retroBoardCardActionId = retroBoardCardActionDoc.id;
        const retroBoardCardToUpdate = this.prepareRetroBoardCardToUpdate(this.currentCard, retroBoardCardActionId);
        this.firestoreService.updateRetroBoardCard(retroBoardCardToUpdate, this.currentCard.id);

        this.currentUserApiService.setRetroBoardCardAction(
          this.currentCard.retroBoardId,
          this.currentCard.id,
          retroBoardCardActionId,
          actionTextValue)
            .then(response => {
              const getModel = response as RetroBoardCardActionsApiAfterAddGetModel;
              const actionToUpdate = {
                retroBoardApiDocId: getModel.retroBoardApiDocId
              };

              this.firestoreService.updateRetroBoardCardAction(actionToUpdate, retroBoardCardActionId);
            })
            .catch(error => {
              const err = error;
            });


        this.bottomSheetRef.dismiss({addedNewActionSuccessfully: true});
      });
    });
  }

  private prepareRetroBoardCardToUpdate(card: RetroBoardCard, actionId: any) {
    const cardToUpdate = {
      isEdit: card.isEdit,
      index: card.index,
      isNewItem: card.isNewItem,
      isMerged: card.isMerged,
      isWentWellRetroBoradCol: card.isWentWellRetroBoradCol,
      voteCount: card.voteCount,
      actions: card.actions
    };

    this.setNewActionArray(cardToUpdate);
    this.prepareNewActionToCard(actionId, cardToUpdate);

    return cardToUpdate;
  }

  private setNewActionArray(cardToUpdate: any) {
    if (!cardToUpdate.actions) {
      cardToUpdate.actions = new Array<any>();
    }
  }

  private prepareNewActionToCard(actionId: any, cardToUpdate: any) {
    const actionRef = this.firestoreService.addRetroBoardCardActionAsRef(actionId);
    cardToUpdate.actions.push(actionRef);
  }
}
