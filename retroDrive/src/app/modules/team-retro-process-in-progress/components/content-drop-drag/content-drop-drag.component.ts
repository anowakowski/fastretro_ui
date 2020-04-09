import { Component, OnInit, OnDestroy} from '@angular/core';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board';
import { Column } from 'src/app/models/column';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamRetroInProgressSnackbarComponent } from '../team-retro-in-progress-snackbar/team-retro-in-progress-snackbar.component';
import { EventsService } from 'src/app/services/events.service';
import { MatDialog } from '@angular/material/dialog';
import { TeamRetroInProgressSetTimeDialogComponent } from '../team-retro-in-progress-set-time-dialog/team-retro-in-progress-set-time-dialog.component';
import { TimerOption } from 'src/app/models/timerOption';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { ActivatedRoute } from '@angular/router';
import { RetroBoard } from 'src/app/models/retroBoard';

const WENT_WELL = 'Went Well';
const TO_IMPROVE = 'To Improve';
@Component({
  selector: 'app-content-drop-drag',
  templateUrl: './content-drop-drag.component.html',
  styleUrls: ['./content-drop-drag.component.scss']
})
export class ContentDropDragComponent implements OnInit, OnDestroy {

  addNewRetroBoardCardForm: FormGroup;
  newCardContentFormControl = new FormControl('', Validators.required);
  isInMerge = true;

  retroBoardData: any;
  private retroBoardParamIdSubscription: any;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private eventsService: EventsService,
    private firestoreRetroInProgressService: FiresrtoreRetroProcessInProgressService,
    private route: ActivatedRoute,
    public dialog: MatDialog) {}

  private wnetWellRetroBoardCol: Column;
  private toImproveRetroBoardCol: Column;

  public board: Board;

  timerOptions: TimerOption[] = [
    { value: '1', viewValue: '3 min' },
    { value: '5', viewValue: '5 min' },
    { value: '7', viewValue: '7 min' },
    { value: '10', viewValue: '10 min' },
    { value: '13', viewValue: '13 min' },
    { value: '15', viewValue: '15 min' },
    { value: '20', viewValue: '20 min' },
  ];

  public shouldStopTimer = false;
  public retroProcessIsStoped = false;
  public shouldEnableVoteBtns = false;
  public stopRetroInProgressProcessSubscriptions: any;

  ngOnInit() {
    if (this.route.snapshot.data['retroBoardData']) {
      this.retroBoardData = this.route.snapshot.data['retroBoardData'];
      console.log(this.retroBoardData);
    } else {
      this.retroBoardParamIdSubscription = this.route.params.subscribe(params => {
        const retroBoardParamId: string = params['id'];

        this.firestoreRetroInProgressService.findRetroBoardByUrlParamId(retroBoardParamId).then(retroBoardsSnapshot => {
          if (retroBoardsSnapshot.docs.length > 0) {
            const findedRetroBoards = retroBoardsSnapshot.docs[0].data() as RetroBoard;
          } else {
            // not finded any retro board
          }
        });
     });
    }

    this.setRetroBoardColumnCards();
    this.createAddNewRetroBoardCardForm();
    this.subscribeEvents();
  }

  ngOnDestroy(): void {
    this.stopRetroInProgressProcessSubscriptions.unsubscribe();
    this.retroBoardParamIdSubscription.unsubscribe();
  }

  createAddNewRetroBoardCardForm() {
    this.addNewRetroBoardCardForm = this.formBuilder.group({
      newCardContentFormControl: this.newCardContentFormControl
    });
  }

  stopTimer() {
    this.shouldStopTimer = true;
  }

  stopRetroProcess() {
    this.eventsService.emitStopRetroInProgressProcessEmiter(true);
  }

  openSnackBar(displayText: string) {
    const durationInSeconds = 5;
    this.snackBar.openFromComponent(TeamRetroInProgressSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        displayText: '' + displayText
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(TeamRetroInProgressSetTimeDialogComponent, {
      width: '400px',
      data: this.timerOptions
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.eventsService.emitTimerOptions(result);
        this.retroProcessIsStoped = false;
      }
    });
  }

  addNewCardToColumn(colName: string) {
    if (this.chcekIfAnyCardIsInEditMode()) {
      this.openSnackBar('you cant add new item when one of card is in edit mode.');
      return;
    }

    if (colName === WENT_WELL) {
      let maxIndexOfElementInArray: number = 0;

      if (this.wnetWellRetroBoardCol.retroBoardCards.length > 0) {
        maxIndexOfElementInArray = Math.max.apply(Math, this.wnetWellRetroBoardCol.retroBoardCards.map(x => x.index));
      }

      const incrementIndex = maxIndexOfElementInArray + 1;
      const newItem: RetroBoardCard = this.prepareNewRetroBoardCard(incrementIndex, true);

      this.wnetWellRetroBoardCol.retroBoardCards.push(newItem);
      this.wnetWellRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);

    } else if (colName === TO_IMPROVE) {
      let maxIndexOfElementInArray: number = 0;

      if (this.toImproveRetroBoardCol.retroBoardCards.length > 0) {
        maxIndexOfElementInArray = Math.max.apply(Math, this.toImproveRetroBoardCol.retroBoardCards.map(x => x.index));
      }

      const incrementIndex = maxIndexOfElementInArray + 1;
      const newItem: RetroBoardCard = this.prepareNewRetroBoardCard(incrementIndex, false);


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

        this.firestoreRetroInProgressService.addNewRetroBoardCard(card);

      } else if (colName === TO_IMPROVE) {
        const index = this.getArrayIndex(card, this.toImproveRetroBoardCol.retroBoardCards);
        this.updaRetroBoardCard(index, card, this.toImproveRetroBoardCol.retroBoardCards);

        this.firestoreRetroInProgressService.addNewRetroBoardCard(card);
      }
    }
  }

  onClickVoteOnCart(currentCard: RetroBoardCard) {
    currentCard.isClickedFromVoteBtn = true;
  }

  onClickMergeCard(currentCard: RetroBoardCard, colName: string) {
    if (colName === WENT_WELL) {
      this.mergeProcess(currentCard, colName, this.wnetWellRetroBoardCol.retroBoardCards);
    } else if (colName === TO_IMPROVE) {
      this.mergeProcess(currentCard, colName, this.toImproveRetroBoardCol.retroBoardCards);
    }
  }

  checkIfRetroBoardIsExists() {
    return this.wnetWellRetroBoardCol.retroBoardCards.length > 0 || this.toImproveRetroBoardCol.retroBoardCards.length > 0;
  }

  private prepareNewRetroBoardCard(incrementIndex: number, isWentWellRetroBoradColBln: boolean): RetroBoardCard {
    return {
      name: '',
      isEdit: true,
      index: incrementIndex,
      isNewItem: true,
      isClickedFromCloseEdit: false,
      isClickedFromMergeBtn: false,
      isClickedFromVoteBtn: false,
      isInMerge: false,
      isMerged: false,
      isWentWellRetroBoradCol: isWentWellRetroBoradColBln,
      mergedContent: new Array<string>()
    };
  }

  private setRetroBoardColumnCards() {
    this.wnetWellRetroBoardCol = new Column(WENT_WELL, this.getWentWellRetroBoardCards());
    this.toImproveRetroBoardCol = new Column(TO_IMPROVE, this.getToImproveRetroBoardCards());

    this.board = new Board('Test Board', [
      this.wnetWellRetroBoardCol,
      this.toImproveRetroBoardCol
    ]);
  }

  private getToImproveRetroBoardCards(): RetroBoardCard[] {

    const retroBoardCards = new Array<RetroBoardCard>();

    // retroBoardCards.push(this.prepareTestData(1, false));
    // retroBoardCards.push(this.prepareTestData(2, false));
    // retroBoardCards.push(this.prepareTestData(3, false));

    return retroBoardCards;
  }

  private getWentWellRetroBoardCards(): RetroBoardCard[] {

    const retroBoardCards = new Array<RetroBoardCard>();

    // retroBoardCards.push(this.prepareTestData(1, true));
    // retroBoardCards.push(this.prepareTestData(2, true));
    // retroBoardCards.push(this.prepareTestData(3, true));
    // retroBoardCards.push(this.prepareTestData(4, true));

    return retroBoardCards;
  }

  private prepareTestData(indexNumb: number, isWentWellRetroBoradColBln: boolean): RetroBoardCard {
    return {
      name: 'Get to work',
      isEdit: false,
      index: indexNumb,
      isClickedFromCloseEdit: false,
      isClickedFromMergeBtn: false,
      isClickedFromVoteBtn: false,
      isInMerge: false,
      isMerged: false,
      isNewItem: false,
      isWentWellRetroBoradCol: isWentWellRetroBoradColBln,
      mergedContent: new Array<string>()
    };
  }

  private mergeProcess(currentCard: RetroBoardCard, colName: string, retroBoardCards: RetroBoardCard[]) {
    const findedFromMergedCart = retroBoardCards.find(card => card.isInMerge);
    const findedCurrentRetroBoardCard = this.getRetroBoardCard(currentCard, retroBoardCards);
    const indexOfFindedCurrentRetroBoardCard = this.getArrayIndex(findedCurrentRetroBoardCard, retroBoardCards);
    this.setCurrentCardAsMerge(currentCard, findedCurrentRetroBoardCard);
    if (findedFromMergedCart !== undefined) {
      this.mergeCards(findedFromMergedCart, currentCard, findedCurrentRetroBoardCard, retroBoardCards, colName);
    } else {
      this.updaRetroBoardCard(indexOfFindedCurrentRetroBoardCard, findedCurrentRetroBoardCard, retroBoardCards);
    }
  }

  private setCurrentCardAsMerge(currentCard: RetroBoardCard, findedCurrentRetroBoardCard: RetroBoardCard) {
    currentCard.isClickedFromMergeBtn = true;
    if (findedCurrentRetroBoardCard.isInMerge) {
      findedCurrentRetroBoardCard.isInMerge = false;
    } else {
      findedCurrentRetroBoardCard.isInMerge = true;
    }
  }

  private isPosibleToMerge(findedFromMergedCart: RetroBoardCard, findedCurrentRetroBoardCard: RetroBoardCard) {
    return findedFromMergedCart.index !== findedCurrentRetroBoardCard.index;
  }

  private mergeCards(
    findedFromMergedCart: RetroBoardCard,
    currentCard: RetroBoardCard,
    findedCurrentRetroBoardCard: RetroBoardCard,
    retroBoardCards: RetroBoardCard[],
    colName: string) {
      if (this.isPosibleToMerge(findedFromMergedCart, currentCard)) {
        if (!findedFromMergedCart.isMerged) {
          findedFromMergedCart.mergedContent = new Array<string>();
          findedFromMergedCart.mergedContent.push(findedFromMergedCart.name);
        }
        if (findedCurrentRetroBoardCard.isMerged) {
          findedCurrentRetroBoardCard.mergedContent.forEach(mc => findedFromMergedCart.mergedContent.push(mc));
        } else {
          findedFromMergedCart.mergedContent.push(currentCard.name);
        }

        findedFromMergedCart.isInMerge = false;
        findedFromMergedCart.isMerged = true;
        const indexOfFindedFromMergedCart = this.getArrayIndex(findedFromMergedCart, retroBoardCards);
        this.updaRetroBoardCard(indexOfFindedFromMergedCart, findedFromMergedCart, retroBoardCards);
        this.removeCard(findedCurrentRetroBoardCard, colName);
      }
  }

  enableVoteBtns() {
    if (this.shouldEnableVoteBtns) {
      this.shouldEnableVoteBtns = false;
    } else {
      this.shouldEnableVoteBtns = true;
    }
  }

  editCard(currentCard: RetroBoardCard, colName: string) {
    if (currentCard.isMerged) {
      return;
    }
    if (currentCard.isEdit || currentCard.isClickedFromVoteBtn || currentCard.isClickedFromMergeBtn) {
      currentCard.isClickedFromVoteBtn = false;
      currentCard.isClickedFromMergeBtn = false;
      return;
    }
    if (!currentCard.isNewItem) {
      if (this.chcekIfAnyCardIsInEditMode()) {
        this.openSnackBar('you cant edit this card when one of the card is in edit mode.');
        return;
      }
      if (currentCard.isClickedFromCloseEdit) {
        if (colName === WENT_WELL) {
          const findedRetroBoardCard = this.getRetroBoardCard(currentCard, this.wnetWellRetroBoardCol.retroBoardCards);
          const index = this.getArrayIndex(findedRetroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards);
          findedRetroBoardCard.isClickedFromCloseEdit = false;
          this.updaRetroBoardCard(index, findedRetroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards);
        } else if (colName === TO_IMPROVE) {
          const findedRetroBoardCard = this.getRetroBoardCard(currentCard, this.toImproveRetroBoardCol.retroBoardCards);
          const index = this.getArrayIndex(findedRetroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
          findedRetroBoardCard.isClickedFromCloseEdit = false;
          this.updaRetroBoardCard(index, findedRetroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
        }
        return;
      }
      if (colName === WENT_WELL) {
        this.processRetroBoardCard(currentCard, this.wnetWellRetroBoardCol.retroBoardCards);
      } else if (colName === TO_IMPROVE) {
        this.processRetroBoardCard(currentCard, this.toImproveRetroBoardCol.retroBoardCards);
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

  private chcekIfAnyCardIsInEditMode(): boolean {
    const findedCardForWentWell = this.wnetWellRetroBoardCol.retroBoardCards.find(col => col.isEdit);
    const findedCardToImprove = this.toImproveRetroBoardCol.retroBoardCards.find(col => col.isEdit);
    return findedCardForWentWell !== undefined || findedCardToImprove !== undefined;
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

  private subscribeEvents() {
    this.stopRetroInProgressProcessSubscriptions =
      this.eventsService.getStopRetroInProgressProcessEmiter().subscribe(retoIsStoped => this.retroProcessIsStoped = retoIsStoped);
  }
}
