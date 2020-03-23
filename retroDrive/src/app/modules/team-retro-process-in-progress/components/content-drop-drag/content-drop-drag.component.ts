import { Component, OnInit, Pipe} from '@angular/core';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board';
import { Column } from 'src/app/models/column';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamRetroInProgressSnackbarComponent } from '../team-retro-in-progress-snackbar/team-retro-in-progress-snackbar.component';

const WENT_WELL = 'Went Well';
const TO_IMPROVE = 'To Improve';
@Component({
  selector: 'app-content-drop-drag',
  templateUrl: './content-drop-drag.component.html',
  styleUrls: ['./content-drop-drag.component.scss']
})
export class ContentDropDragComponent implements OnInit {

  addNewRetroBoardCardForm: FormGroup;
  newCardContentFormControl = new FormControl('', Validators.required);

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar) {}

  private wnetWellRetroBoardCol = new Column(WENT_WELL, [
    new RetroBoardCard('Get to work', false, 1),
    new RetroBoardCard('Get to work', false, 2),
    new RetroBoardCard('Get to work', false, 3),
    new RetroBoardCard('Get to work', false, 4),
  ]);
  private toImproveRetroBoardCol = new Column(TO_IMPROVE, [
    new RetroBoardCard('Get to work', false, 1),
    new RetroBoardCard('Get to work', false, 2),
    new RetroBoardCard('Get to work', false, 3),
  ]);

  public shouldStopTimer = false;

  board: Board = new Board('Test Board', [
    this.wnetWellRetroBoardCol,
    this.toImproveRetroBoardCol
  ]);

  ngOnInit() {
    this.createAddNewRetroBoardCardForm();
  }

  createAddNewRetroBoardCardForm() {
    this.addNewRetroBoardCardForm = this.formBuilder.group({
      newCardContentFormControl: this.newCardContentFormControl
    });
  }

  stopTimer() {
    this.shouldStopTimer = true;
  }

  openSnackBarForDelete(displayText: string) {
    const durationInSeconds = 3;
    this.snackBar.openFromComponent(TeamRetroInProgressSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        displayText: '' + displayText
      }
    });
  }

  addNewCardToColumn(colName: string) {
    if (this.chcekIfAnyCardIsInEditMode(colName)) {
      this.openSnackBarForDelete('you cant add new item when one of card is currently in edit mode.');
      return;
    }

    if (colName === WENT_WELL) {
      const maxIndexOfElementInArray = Math.max.apply(Math, this.wnetWellRetroBoardCol.retroBoardCards.map(x => x.index));
      const incrementIndex = maxIndexOfElementInArray + 1;
      const newItem = new RetroBoardCard('', true, incrementIndex);
      newItem.isNewItem = true;

      this.wnetWellRetroBoardCol.retroBoardCards.push(newItem);
      this.wnetWellRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);

    } else if (colName === TO_IMPROVE) {
      const maxIndexOfElementInArray = Math.max.apply(Math, this.toImproveRetroBoardCol.retroBoardCards.map(x => x.index));
      const incrementIndex = maxIndexOfElementInArray + 1;
      const newItem = new RetroBoardCard('', true, incrementIndex);
      newItem.isNewItem = true;

      this.toImproveRetroBoardCol.retroBoardCards.push(newItem);
      this.toImproveRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);
    }
  }

  saveRetroBoardCard(card: RetroBoardCard, colName: string) {
    if (this.addNewRetroBoardCardForm.valid) {
      const newCardContentFormControlValue = this.addNewRetroBoardCardForm.value.newCardContentFormControl;
      card.name = newCardContentFormControlValue;
      card.isNewItem = false;
      card.isEdit = false;
      this.addNewRetroBoardCardForm.reset();

      if (colName === WENT_WELL) {
        const index = this.getArrayIndex(card, this.wnetWellRetroBoardCol.retroBoardCards);
        this.updaRetroBoardCard(index, card, this.wnetWellRetroBoardCol.retroBoardCards);
      } else if (colName === TO_IMPROVE) {
        const index = this.getArrayIndex(card, this.toImproveRetroBoardCol.retroBoardCards);
        this.updaRetroBoardCard(index, card, this.toImproveRetroBoardCol.retroBoardCards);
      }
    }
  }

  editCard(card: RetroBoardCard, colName: string) {
    if (!card.isNewItem) {
      if (this.chcekIfAnyCardIsInEditMode(colName) || card.isEdit) {
        return;
      }
      if (card.isClickedFromCloseEdit) {
        if (colName === WENT_WELL) {
          const findedRetroBoardCard = this.getRetroBoardCard(card, this.wnetWellRetroBoardCol.retroBoardCards);
          const index = this.getArrayIndex(findedRetroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards);
          findedRetroBoardCard.isClickedFromCloseEdit = false;
          this.updaRetroBoardCard(index, findedRetroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards);
        } else if (colName === TO_IMPROVE) {
          const findedRetroBoardCard = this.getRetroBoardCard(card, this.toImproveRetroBoardCol.retroBoardCards);
          const index = this.getArrayIndex(findedRetroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
          findedRetroBoardCard.isClickedFromCloseEdit = false;
          this.updaRetroBoardCard(index, findedRetroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
        }
        return;
      }
      if (colName === WENT_WELL) {
        this.processRetroBoardCard(card, this.wnetWellRetroBoardCol.retroBoardCards);
      } else if (colName === TO_IMPROVE) {
        this.processRetroBoardCard(card, this.toImproveRetroBoardCol.retroBoardCards);
      }
    }
  }

  closeEditCard(card: RetroBoardCard, colName: string) {
    const newCardContentFormControlValue = this.addNewRetroBoardCardForm.value.newCardContentFormControl;
    if (colName === WENT_WELL) {
      this.closeEditRetroBoardCardProcess(card, this.wnetWellRetroBoardCol.retroBoardCards);
    } else if (colName === TO_IMPROVE) {
      this.closeEditRetroBoardCardProcess(card, this.toImproveRetroBoardCol.retroBoardCards);
    }

    if (newCardContentFormControlValue === '' || newCardContentFormControlValue === null) {
      this.removeCard(card, colName);
    }

    this.addNewRetroBoardCardForm.reset();
  }

  removeCard(card: RetroBoardCard, colName: string) {
    if (colName === WENT_WELL) {
      const findedRetroBoardCard = this.getRetroBoardCard(card, this.wnetWellRetroBoardCol.retroBoardCards);
      const index = this.getArrayIndex(findedRetroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards);
      this.wnetWellRetroBoardCol.retroBoardCards.splice(index, 1);
    } else if (colName === TO_IMPROVE) {
      const findedRetroBoardCard = this.getRetroBoardCard(card, this.toImproveRetroBoardCol.retroBoardCards);
      const index = this.getArrayIndex(findedRetroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
      this.toImproveRetroBoardCol.retroBoardCards.splice(index, 1);
    }

    this.addNewRetroBoardCardForm.reset();
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  setNewCardContentFormControl(value: string) {
    this.newCardContentFormControl.setValue(value);
  }

  private chcekIfAnyCardIsInEditMode(colName: string): boolean {
    if (colName === WENT_WELL) {
      const findedCard = this.wnetWellRetroBoardCol.retroBoardCards.find(col => col.isEdit);
      return findedCard !== null;
    } else if (colName === TO_IMPROVE) {
      const findedCard = this.toImproveRetroBoardCol.retroBoardCards.find(col => col.isEdit);
      return findedCard !== undefined;
    }
  }

  private processRetroBoardCard(card: RetroBoardCard, retroBoardCards: Array<RetroBoardCard>) {
    const findedRetroBoardCard = this.getRetroBoardCard(card, retroBoardCards);
    const index = this.getArrayIndex(findedRetroBoardCard, retroBoardCards);
    findedRetroBoardCard.isEdit = true;
    this.updaRetroBoardCard(index, findedRetroBoardCard, retroBoardCards);
    this.setNewCardContentFormControl(card.name);
  }


  private closeEditRetroBoardCardProcess(card: RetroBoardCard, retroBoardCards: Array<RetroBoardCard>) {
    const findedRetroBoardCard = this.getRetroBoardCard(card, retroBoardCards);
    const index = this.getArrayIndex(findedRetroBoardCard, retroBoardCards);
    findedRetroBoardCard.isEdit = false;
    findedRetroBoardCard.isClickedFromCloseEdit = true;
    this.updaRetroBoardCard(index, findedRetroBoardCard, retroBoardCards);
  }

  private updaRetroBoardCard(index: number, retroBoardCardToUpdate: RetroBoardCard, retroBoardCards: Array<RetroBoardCard>) {
    retroBoardCards[index] = retroBoardCardToUpdate;
  }

  private getRetroBoardCard(card: RetroBoardCard, retroBoardCards: Array<RetroBoardCard>) {
    return retroBoardCards.find(x => x.index === card.index);
  }


  private getArrayIndex(findedRetroBoardCard: RetroBoardCard, array: any[]) {
    return array.indexOf(findedRetroBoardCard);
  }
}