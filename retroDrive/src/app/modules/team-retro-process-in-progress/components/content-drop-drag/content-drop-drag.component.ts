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
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { MergedRetroBoardCard } from 'src/app/models/mergedRetroBoardCard';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AddNewActionBottomsheetComponent } from '../add-new-action-bottomsheet/add-new-action-bottomsheet.component';
import { TeamRetroInProgressShowActionDialogComponent } from '../team-retro-in-progress-show-action-dialog/team-retro-in-progress-show-action-dialog.component';
import { TeamRetroInProgressShowAllActionsDialogComponent } from '../team-retro-in-progress-show-all-actions-dialog/team-retro-in-progress-show-all-actions-dialog.component';

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
    private authServices: AuthService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private bottomSheetRef: MatBottomSheet) {}

  private wnetWellRetroBoardCol: Column;
  private toImproveRetroBoardCol: Column;

  public board: Board;
  private retroBoardToProcess: RetroBoard;
  public isRetroBoardIsReady = false;
  public isExistingSomeRetroBoardCardAction = false;

  currentUser: User;

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
  public timerIsRunning = false;

  public shouldEnableVoteBtns = true;
  public stopRetroInProgressProcessSubscriptions: any;
  public retroBoardCardsSubscriptions: any;

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');
    this.prepareBaseRetroBoardData();
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
    this.timerIsRunning = false;
    this.eventsService.emitStopTimer(true);
  }

  stopRetroProcess() {
    this.retroProcessIsStoped = true;
    this.timerIsRunning = false;
    this.shouldEnableVoteBtns = false;
    this.eventsService.emitStopRetroInProgressProcessEmiter(true);
  }

  openRetroProcess() {
    this.retroProcessIsStoped = false;
    this.shouldEnableVoteBtns = true;
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

  openSetTimerDialog(): void {
    const dialogRef = this.dialog.open(TeamRetroInProgressSetTimeDialogComponent, {
      width: '400px',
      data: this.timerOptions
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.eventsService.emitTimerOptions(result);
        this.retroProcessIsStoped = false;
        this.timerIsRunning = true;
      }
    });
  }

  openCardActionDialog(currentCard: RetroBoardCard) {
    currentCard.isClickedFromAddActionBtn = true;
    const dialogRef = this.dialog.open(TeamRetroInProgressShowActionDialogComponent, {
      width: '1100px',
      //minHeight: '400px',
      data: currentCard
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {}
    });
  }

  openAllCardActionDialog() {
    const retroBoardCardToShow = new Array<RetroBoardCard>();
    this.prepareRetroBoardCardToShowInAllActionView(this.wnetWellRetroBoardCol.retroBoardCards, retroBoardCardToShow);
    this.prepareRetroBoardCardToShowInAllActionView(this.toImproveRetroBoardCol.retroBoardCards, retroBoardCardToShow);

    retroBoardCardToShow.concat(this.toImproveRetroBoardCol.retroBoardCards);

    const dialogRef = this.dialog.open(TeamRetroInProgressShowAllActionsDialogComponent, {
      width: '1100px',
      data: retroBoardCardToShow
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {}
    });
  }

  private prepareRetroBoardCardToShowInAllActionView(retroBoardCards: RetroBoardCard[], retroBoardCardsToShow: RetroBoardCard[]) {
    const fliteredRetroBoardCard = retroBoardCards.filter(rtb => rtb.actions.some(a => a));
    fliteredRetroBoardCard.forEach(retroBoardCard => {
      retroBoardCardsToShow.push(retroBoardCard);
    });
  }

  addNewCardToColumn(colName: string) {
    if (this.chcekIfAnyCardIsInEditMode()) {
      this.openSnackBar('you cant add new item when one of card is in edit mode.');
      return;
    }

    if (colName === WENT_WELL) {
      let maxIndexOfElementInArray = 0;

      if (this.wnetWellRetroBoardCol.retroBoardCards.length > 0) {
        maxIndexOfElementInArray = Math.max.apply(Math, this.wnetWellRetroBoardCol.retroBoardCards.map(x => x.index));
      }

      const incrementIndex = maxIndexOfElementInArray + 1;
      const newItem: RetroBoardCard = this.prepareNewRetroBoardCardToSave(incrementIndex, true);

      this.wnetWellRetroBoardCol.retroBoardCards.push(newItem);
      this.wnetWellRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);

    } else if (colName === TO_IMPROVE) {
      let maxIndexOfElementInArray = 0;

      if (this.toImproveRetroBoardCol.retroBoardCards.length > 0) {
        maxIndexOfElementInArray = Math.max.apply(Math, this.toImproveRetroBoardCol.retroBoardCards.map(x => x.index));
      }

      const incrementIndex = maxIndexOfElementInArray + 1;
      const newItem: RetroBoardCard = this.prepareNewRetroBoardCardToSave(incrementIndex, false);

      this.toImproveRetroBoardCol.retroBoardCards.push(newItem);
      this.toImproveRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);
    }
  }

  saveRetroBoardCard(card: RetroBoardCard, colName: string) {
    if (this.addNewRetroBoardCardForm.valid) {
      const newCardContentFormControlValue = this.addNewRetroBoardCardForm.value.newCardContentFormControl;
      card.name = newCardContentFormControlValue;
      this.addNewRetroBoardCardForm.reset();
      if (card.isNewItem && card.isEdit) {
        card.isNewItem = false;
        card.isEdit = false;
        const cardToSave = this.prepareRetroBoardCardToSave(card);
        this.firestoreRetroInProgressService.addNewRetroBoardCard(cardToSave);
        this.removeLocalCardFromArray(card, colName);
      } else if (!card.isNewItem && card.isEdit) {
        this.firestoreRetroInProgressService.findRetroBoardCardById(card.id).then(retroBoardCardSnapshot => {
          if (retroBoardCardSnapshot.exists) {
            card.isNewItem = false;
            card.isEdit = false;
            const cardToUpdate = this.prepareRetroBoardCardToUpdate(card);
            this.firestoreRetroInProgressService.updateRetroBoardCard(cardToUpdate, card.id);
            this.removeLocalCardFromArray(card, colName);
          }
        });
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

  onClickUnmergeCard(currentCard: RetroBoardCard, colName: string) {
    if (currentCard.isMerged) {
      currentCard.mergedContent.forEach(content => {
         const newRetroBoardCard =
          this.prepareRetroBoardCardToSaveFromMerged(content, currentCard.isWentWellRetroBoradCol, currentCard.index);
         this.firestoreRetroInProgressService.addNewRetroBoardCard(newRetroBoardCard);
      });

      this.firestoreRetroInProgressService.removeRetroBoardCard(currentCard.id);
    }
  }

  onVoteCard(currentCard: RetroBoardCard) {
    currentCard.isClickedFromVoteBtn = true;
    this.firestoreRetroInProgressService.findRetroBoardCardById(currentCard.id).then(findedRetroBoardCardDoc => {
      const findedRetroBoardCard = findedRetroBoardCardDoc.data() as RetroBoardCard;
      const findedRetroBoardCardDocId = findedRetroBoardCardDoc.id;
      findedRetroBoardCard.voteCount++;
      const cardToUpdate = this.prepareRetroBoardCardToUpdate(findedRetroBoardCard);
      this.firestoreRetroInProgressService.updateRetroBoardCard(cardToUpdate, findedRetroBoardCardDocId);
    });
  }

  onAddActionToCard(currentCard: RetroBoardCard) {
    currentCard.isClickedFromAddActionBtn = true;
    currentCard.isInAddedToAction = true;
    const bottomSheetRef = this.bottomSheetRef.open(AddNewActionBottomsheetComponent, {
      data: currentCard
    });

    bottomSheetRef.afterDismissed().subscribe(() => {
      console.log('Bottom sheet has been dismissed.');
      currentCard.isInAddedToAction = false;
    });
  }

  checkIfRetroBoardIsExists() {
    return this.wnetWellRetroBoardCol.retroBoardCards.length > 0 || this.toImproveRetroBoardCol.retroBoardCards.length > 0;
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
    if (currentCard.isEdit ||
      currentCard.isClickedFromVoteBtn ||
      currentCard.isClickedFromMergeBtn ||
      currentCard.isClickedFromAddActionBtn ||
      currentCard.isClickedFromShowActionBtn) {
        currentCard.isClickedFromVoteBtn = false;
        currentCard.isClickedFromMergeBtn = false;
        currentCard.isClickedFromAddActionBtn = false;
        currentCard.isClickedFromShowActionBtn = false;
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
          this.updateLocalRetroBoardCard(index, findedRetroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards);
        } else if (colName === TO_IMPROVE) {
          const findedRetroBoardCard = this.getRetroBoardCard(currentCard, this.toImproveRetroBoardCol.retroBoardCards);
          const index = this.getArrayIndex(findedRetroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
          findedRetroBoardCard.isClickedFromCloseEdit = false;
          this.updateLocalRetroBoardCard(index, findedRetroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
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
      this.removeLocalCardFromArray(card, colName);
    }

    this.addNewRetroBoardCardForm.reset();
  }

  removeLocalCardFromArray(card: RetroBoardCard, colName: string) {
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
    if (!this.retroProcessIsStoped) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
    }
  }

  setNewCardContentFormControl(value: string) {
    this.newCardContentFormControl.setValue(value);
  }

  private prepareBaseRetroBoardData() {
    if (this.route.snapshot.data['retroBoardData']) {
      this.getingDataAfterClickStartRetroProcess();
    } else {
      this.getingDataFromUrl();
    }
  }

  private getingDataFromUrl() {
    this.retroBoardParamIdSubscription = this.route.params.subscribe(params => {
      const retroBoardParamId: string = params['id'];
      this.firestoreRetroInProgressService.findRetroBoardByUrlParamId(retroBoardParamId).then(retroBoardsSnapshot => {
        if (retroBoardsSnapshot.docs.length > 0) {
          const findedRetroBoard = retroBoardsSnapshot.docs[0].data() as RetroBoard;
          this.retroBoardToProcess = findedRetroBoard;
          this.retroBoardToProcess.id = retroBoardsSnapshot.docs[0].id;
          this.isRetroBoardIsReady = true;
          this.setRetroBoardCardSubscription();
          this.setRetroBoardColumnCards();
          this.createAddNewRetroBoardCardForm();
          this.subscribeEvents();
        } else {
          // not finded any retro board
        }
      });
    });
  }

  private setRetroBoardCardSubscription() {
    this.retroBoardCardsSubscriptions =
      this.firestoreRetroInProgressService.retroBoardCardsFilteredSnapshotChanges().subscribe(retroBoardCardsSnapshot => {
        this.wnetWellRetroBoardCol.retroBoardCards = this.clearRetroBoardCardsLocalArray();
        this.toImproveRetroBoardCol.retroBoardCards = this.clearRetroBoardCardsLocalArray();
        retroBoardCardsSnapshot.forEach(retroBoardCardSnapshot => {
          const retroBoardCard = retroBoardCardSnapshot.payload.doc.data() as RetroBoardCard;
          const retroBoardCardDocId = retroBoardCardSnapshot.payload.doc.id as string;
          retroBoardCard.id = retroBoardCardDocId;
          this.addRetroBoardCardToCorrectColumn(retroBoardCard);
        });
        this.setIsExistingSomeRetroBoardCardActions();
      });
  }


  setIsExistingSomeRetroBoardCardActions() {
    this.isExistingSomeRetroBoardCardAction = false;

    const isExistingActionInWentWell = this.wnetWellRetroBoardCol.retroBoardCards.some(x => x.actions.length > 0);
    const isExistingActionInToImprove = this.toImproveRetroBoardCol.retroBoardCards.some(x => x.actions.length > 0);

    if (isExistingActionInWentWell || isExistingActionInToImprove) {
      this.isExistingSomeRetroBoardCardAction = true;
    } else {
      this.isExistingSomeRetroBoardCardAction = false;
    }
  }


  private addRetroBoardCardToCorrectColumn(retroBoardCard: RetroBoardCard) {
    if (retroBoardCard.isWentWellRetroBoradCol) {
      this.wnetWellRetroBoardCol.retroBoardCards.push(retroBoardCard);
    } else {
      this.toImproveRetroBoardCol.retroBoardCards.push(retroBoardCard);
    }
  }

  private getingDataAfterClickStartRetroProcess() {
    this.retroBoardData = this.route.snapshot.data['retroBoardData'];
    this.retroBoardToProcess = this.retroBoardData;
    this.isRetroBoardIsReady = true;
    this.setRetroBoardColumnCards();
    this.createAddNewRetroBoardCardForm();
    this.subscribeEvents();
    this.setRetroBoardCardSubscription();
  }

  private prepareRetroBoardCardToSave(card: RetroBoardCard) {
    const cardToSave = {
      name: card.name,
      isEdit: card.isEdit,
      index: card.index,
      isNewItem: card.isNewItem,
      isMerged: card.isMerged,
      isWentWellRetroBoradCol: card.isWentWellRetroBoradCol,
      mergedContent: card.mergedContent,
      retroBoard: this.firestoreRetroInProgressService.addRetroBoardAsRef(this.retroBoardToProcess.id),
      user: this.firestoreRetroInProgressService.addUserAsRef(this.currentUser.uid),
      voteCount: card.voteCount,
      actions: new Array<any>()
    };

    return cardToSave;
  }

  private prepareRetroBoardCardToSaveFromMerged(mergedCard: MergedRetroBoardCard, isWentWellRetroBoradCol: boolean, index: number) {
    return {
      name: mergedCard.name,
      user: mergedCard.user,
      // tslint:disable-next-line:object-literal-shorthand
      index: index,
      isNewItem: false,
      isMerged: false,
      isEdit: false,
      // tslint:disable-next-line:object-literal-shorthand
      isWentWellRetroBoradCol: isWentWellRetroBoradCol,
      mergedContent: new Array<MergedRetroBoardCard>(),
      voteCount: 0,
      actions: new Array<any>()
    };
  }

  private prepareRetroBoardCardToUpdate(card: RetroBoardCard) {
    return {
      name: card.name,
      isEdit: card.isEdit,
      index: card.index,
      isNewItem: card.isNewItem,
      isMerged: card.isMerged,
      isWentWellRetroBoradCol: card.isWentWellRetroBoradCol,
      mergedContent: card.mergedContent,
      voteCount: card.voteCount
    };
  }

  private prepareNewRetroBoardCardToSave(incrementIndex: number, isWentWellRetroBoradColBln: boolean): RetroBoardCard {
    return {
      name: '',
      isEdit: true,
      index: incrementIndex,
      isNewItem: true,
      isClickedFromCloseEdit: false,
      isClickedFromMergeBtn: false,
      isClickedFromVoteBtn: false,
      isClickedFromAddActionBtn: false,
      isInAddedToAction: false,
      isClickedFromShowActionBtn: false,
      isInMerge: false,
      isMerged: false,
      isWentWellRetroBoradCol: isWentWellRetroBoradColBln,
      mergedContent: new Array<MergedRetroBoardCard>(),
      retroBoard: this.retroBoardToProcess,
      user: this.currentUser,
      id: '',
      voteCount: 0,
      actions: new Array<any>()
    };
  }

  private setRetroBoardColumnCards() {
    this.wnetWellRetroBoardCol = new Column(WENT_WELL, this.clearRetroBoardCardsLocalArray());
    this.toImproveRetroBoardCol = new Column(TO_IMPROVE, this.clearRetroBoardCardsLocalArray());

    const boardTitle = 'Retro for ' + this.retroBoardToProcess.retroName + ' board';
    this.board = new Board(
      boardTitle, [
        this.wnetWellRetroBoardCol,
        this.toImproveRetroBoardCol
      ],
      this.retroBoardToProcess);
  }

  private clearRetroBoardCardsLocalArray(): RetroBoardCard[] {
    return new Array<RetroBoardCard>();
  }

  private mergeProcess(currentCard: RetroBoardCard, colName: string, retroBoardCards: RetroBoardCard[]) {
    const findedFromMergedCart = retroBoardCards.find(card => card.isInMerge);
    const findedCurrentRetroBoardCard = this.getRetroBoardCard(currentCard, retroBoardCards);
    const indexOfFindedCurrentRetroBoardCard = this.getArrayIndex(findedCurrentRetroBoardCard, retroBoardCards);
    this.setCurrentCardAsMerge(currentCard, findedCurrentRetroBoardCard);
    if (findedFromMergedCart !== undefined) {
      this.mergeLocalCards(findedFromMergedCart, currentCard, findedCurrentRetroBoardCard);
    } else {
      this.updateLocalRetroBoardCard(indexOfFindedCurrentRetroBoardCard, findedCurrentRetroBoardCard, retroBoardCards);
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
    return findedFromMergedCart.id !== findedCurrentRetroBoardCard.id;
  }

  private mergeLocalCards(
    findedFromMergedCart: RetroBoardCard,
    currentCard: RetroBoardCard,
    findedCurrentRetroBoardCard: RetroBoardCard) {
      if (this.isPosibleToMerge(findedFromMergedCart, currentCard)) {
        this.setCardWithMergeRules(findedFromMergedCart, findedCurrentRetroBoardCard, currentCard);
        this.saveNewMergeRetroBoardCard(findedFromMergedCart, findedCurrentRetroBoardCard);
      }
  }

  private saveNewMergeRetroBoardCard(findedFromMergedCart: RetroBoardCard, findedCurrentRetroBoardCard: RetroBoardCard) {
    findedFromMergedCart.isInMerge = false;
    findedFromMergedCart.isMerged = true;

    this.firestoreRetroInProgressService.removeRetroBoardCard(findedFromMergedCart.id);
    this.firestoreRetroInProgressService.removeRetroBoardCard(findedCurrentRetroBoardCard.id);
    const cardToSave = this.prepareRetroBoardCardToSave(findedFromMergedCart);
    cardToSave.voteCount = 0;
    this.firestoreRetroInProgressService.addNewRetroBoardCard(cardToSave);
  }

  private setCardWithMergeRules(
    findedFromMergedCart: RetroBoardCard, findedCurrentRetroBoardCard: RetroBoardCard, currentCard: RetroBoardCard) {
    if (!findedFromMergedCart.isMerged) {
      findedFromMergedCart.mergedContent = new Array<MergedRetroBoardCard>();
      findedFromMergedCart.mergedContent.push(this.prepareMergedRetroBoardCard(findedFromMergedCart));
    }
    if (findedCurrentRetroBoardCard.isMerged) {
      findedCurrentRetroBoardCard.mergedContent.forEach(mc => findedFromMergedCart.mergedContent.push(mc));
    } else {
      findedFromMergedCart.mergedContent.push(this.prepareMergedRetroBoardCard(currentCard));
    }
  }

  private prepareMergedRetroBoardCard(retroBoardCard: RetroBoardCard): MergedRetroBoardCard {
    return { name: retroBoardCard.name, user: retroBoardCard.user };
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
    this.updateLocalRetroBoardCard(index, findedRetroBoardCard, retroBoardCards);
    this.setNewCardContentFormControl(card.name);
  }

  private closeEditRetroBoardCardProcess(card: RetroBoardCard, retroBoardCards: Array<RetroBoardCard>) {
    const findedRetroBoardCard = this.getRetroBoardCard(card, retroBoardCards);
    const index = this.getArrayIndex(findedRetroBoardCard, retroBoardCards);
    findedRetroBoardCard.isEdit = false;
    findedRetroBoardCard.isClickedFromCloseEdit = true;
    this.updateLocalRetroBoardCard(index, findedRetroBoardCard, retroBoardCards);
  }

  private updateLocalRetroBoardCard(index: number, retroBoardCardToUpdate: RetroBoardCard, retroBoardCards: Array<RetroBoardCard>) {
    retroBoardCards[index] = retroBoardCardToUpdate;
  }

  private getRetroBoardCard(card: RetroBoardCard, retroBoardCards: Array<RetroBoardCard>) {
    return retroBoardCards.find(x => x.id === card.id);
  }

  private getArrayIndex(findedRetroBoardCard: RetroBoardCard, array: any[]) {
    return array.indexOf(findedRetroBoardCard);
  }

  private subscribeEvents() {
    this.stopRetroInProgressProcessSubscriptions =
      this.eventsService.getStopRetroInProgressProcessEmiter().subscribe(retoIsStoped => this.retroProcessIsStoped = retoIsStoped);
  }
}
