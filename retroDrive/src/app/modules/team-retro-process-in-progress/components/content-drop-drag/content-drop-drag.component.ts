import { Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board';
import { Column } from 'src/app/models/column';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamRetroInProgressSnackbarComponent } from '../team-retro-in-progress-snackbar/team-retro-in-progress-snackbar.component';
import { EventsService } from 'src/app/services/events.service';
import { MatDialog } from '@angular/material/dialog';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressSetTimeDialogComponent } from '../team-retro-in-progress-set-time-dialog/team-retro-in-progress-set-time-dialog.component';
import { TimerOption } from 'src/app/models/timerOption';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RetroBoardToSave } from 'src/app/models/retroBoardToSave';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { MergedRetroBoardCard } from 'src/app/models/mergedRetroBoardCard';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AddNewActionBottomsheetComponent } from '../add-new-action-bottomsheet/add-new-action-bottomsheet.component';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressShowActionDialogComponent } from '../team-retro-in-progress-show-action-dialog/team-retro-in-progress-show-action-dialog.component';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressShowAllActionsDialogComponent } from '../team-retro-in-progress-show-all-actions-dialog/team-retro-in-progress-show-all-actions-dialog.component';
import { TimerSettingToSave } from 'src/app/models/timerSettingToSave';
import { formatDate } from '@angular/common';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { Team } from 'src/app/models/team';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Workspace } from 'src/app/models/workspace';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressUserWithoutRbWorkspaceDialogComponent } from '../team-retro-in-progress-user-without-rb-workspace-dialog/team-retro-in-progress-user-without-rb-workspace-dialog.component';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { UserWorkspaceDataToSave } from 'src/app/models/userWorkspaceDataToSave';
import { UserWorkspaceData } from 'src/app/models/userWorkspaceData';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressUserWithoutRbTeamDialogComponent } from '../team-retro-in-progress-user-without-rb-team-dialog/team-retro-in-progress-user-without-rb-team-dialog.component';
import { CurrentUsersInRetroBoardToSave } from 'src/app/models/currentUsersInRetroBoardToSave';
import { CurrentUsersInRetroBoard } from 'src/app/models/currentUsersInRetroBoard';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent } from '../team-retro-in-progress-show-all-users-in-current-retro-dialog/team-retro-in-progress-show-all-users-in-current-retro-dialog-component';
import { SpinnerTickService } from 'src/app/services/spinner-tick.service';
import { UserInRetroBoardData } from 'src/app/models/userInRetroBoardData';

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
  private timerIsFinsihedSubscriptions: any;
  userIsNotInCurrentRetroBoardWorkspace = false;
  userIsNotInCurrentRetroBoardTeam = false;

  currentUsersInRetroBoard: CurrentUsersInRetroBoard;
  currentUsersInRetroBoardCount = 0;
  curentUserInRetroBoardSubscription: any;
  tickSubscription: any;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private eventsService: EventsService,
    private firestoreRetroInProgressService: FiresrtoreRetroProcessInProgressService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private bottomSheetRef: MatBottomSheet,
    private spinnerTickService: SpinnerTickService) {}

  private wnetWellRetroBoardCol: Column;
  private toImproveRetroBoardCol: Column;

  public board: Board;
  private retroBoardToProcess: RetroBoardToSave;
  public isRetroBoardIsReady = false;
  public isExistingSomeRetroBoardCardAction = false;

  currentUser: User;
  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;

  timerOptions: TimerOption[];

  public shouldStopTimer = false;
  public retroProcessIsStoped = false;
  public timerIsRunning = false;

  public shouldEnableVoteBtns = true;
  public stopRetroInProgressProcessSubscriptions: any;
  public retroBoardCardsSubscriptions: any;
  public retroBoardSubscriptions: any;

  /*
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (true) {
      // this.firestoreRetroInProgressService.removeCurrentUserToRetroBoard('Gg5WXSoDrcsQPpmwmhQu');
      this.removeCurrentUserToRetroBoardProcess($event);
      $event.returnValue = true;
    }
  }
  */

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
    this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;

    this.prepareBaseRetroBoardData();
    this.getTimerOptions();
    // this.createPersistentTimerOptions();
  }

  ngOnDestroy(): void {
    this.stopRetroInProgressProcessSubscriptions.unsubscribe();
    if (this.retroBoardParamIdSubscription !== undefined) {
      this.retroBoardParamIdSubscription.unsubscribe();
    }
    if (this.curentUserInRetroBoardSubscription !== undefined) {
      this.curentUserInRetroBoardSubscription.unsubscribe();
    }
    if (this.tickSubscription !== undefined) {
      this.tickSubscription.unsubscribe();
    }
    this.timerIsFinsihedSubscriptions.unsubscribe();
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
    this.timerIsRunning = false;
    this.shouldEnableVoteBtns = false;

    this.setIsFinishedInRetroBoard(true);
    this.eventsService.emitStopRetroInProgressProcessEmiter(true);
  }

  private setIsFinishedInRetroBoard(isFinished: boolean) {
    this.retroProcessIsStoped = isFinished;
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    // tslint:disable-next-line:object-literal-shorthand
    const retroBoardToUpdate = { isFinished: isFinished, lastModifiedDate: currentDate };
    this.firestoreRetroInProgressService.updateRetroBoard(retroBoardToUpdate, this.retroBoardToProcess.id);
  }

  openRetroProcess() {
    this.shouldEnableVoteBtns = true;

    this.setIsFinishedInRetroBoard(false);
    this.eventsService.emitStartRetroInProgressProcessEmiter(true);
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
        const timerOpt = result as TimerOption;
        this.firestoreRetroInProgressService.getFilteredTimerSettingForCurrentRetroBoard(this.retroBoardToProcess.id)
          .then(timerSettingsSnapshot => {
            if (timerSettingsSnapshot.docs.length  > 0) {
              const timerSettingId = timerSettingsSnapshot.docs[0].id;
              const timerSettingToUpdate = { chosenTimerOpt: timerOpt, isStarted: true };
              this.firestoreRetroInProgressService.updateCurrentTimerSettings(timerSettingToUpdate, timerSettingId);
            }
          });
        // this.eventsService.emitTimerOptions(result);
        this.retroProcessIsStoped = false;
        this.timerIsRunning = true;
      }
    });
  }

  openCardActionDialog(currentCard: RetroBoardCard) {
    currentCard.isClickedFromAddActionBtn = true;
    const dialogRef = this.dialog.open(TeamRetroInProgressShowActionDialogComponent, {
      width: '1100px',
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

  onOpenShowAllCurrentUsersInRetro() {
    this.openShowAllCurrentUsersInRetroDialog();
  }

  private openShowAllCurrentUsersInRetroDialog() {
    const dialogRef = this.dialog.open(TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent, {
      width: '400px',
      data: this.currentUsersInRetroBoard
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
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
    if (this.currentUser.uid !== currentCard.userId) {
      return;
    }
    if (this.retroBoardToProcess.isFinished) {
      return;
    }
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

  private spinnerTick() {
    const maxTimmerValue = 10;
    let currentValue = 0;
    this.tickSubscription =
      this.spinnerTickService.runNewTimer(1000).subscribe((interval) => {
        currentValue++;
        if (currentValue === maxTimmerValue) {
          this.firestoreRetroInProgressService.getCurrentUserInRetroBoard(this.retroBoardToProcess.id)
          .then(currentUserInRetroBoardSnapshot => {
            const findedCurrentUserInRetroBoard = currentUserInRetroBoardSnapshot.docs[0].data() as CurrentUsersInRetroBoardToSave;
            const findedCurrentUserInRetroBoardId = currentUserInRetroBoardSnapshot.docs[0].id as string;
            const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');

            this.addCurrentTickDateToUserInRetro(findedCurrentUserInRetroBoard, currentDate, findedCurrentUserInRetroBoardId);
            this.removeExpiredUserProcess(findedCurrentUserInRetroBoard, currentDate);
          });
          currentValue = 0;
        }
      });
  }

  private removeExpiredUserProcess(findedCurrentUserInRetroBoard: CurrentUsersInRetroBoardToSave, currentDate: string) {
    findedCurrentUserInRetroBoard.usersInRetroBoardData.forEach(usrInRetroBoard => {
      const dateDiff = Date.parse(currentDate) - Date.parse(usrInRetroBoard.dateOfExistingCheck);
      if (dateDiff > 0) {
        const dateDiffinSec = (dateDiff / 1000);
        if (dateDiffinSec > 15) {
          this.removeCurrentUserToRetroBoardProcess(usrInRetroBoard.userId);
        }
      }
    });
  }

  private addCurrentTickDateToUserInRetro(
    findedCurrentUserInRetroBoard: CurrentUsersInRetroBoardToSave,
    currentDate: string,
    findedCurrentUserInRetroBoardId: string) {
      if (findedCurrentUserInRetroBoard.usersInRetroBoardData.some(usr => usr.userId === this.currentUser.uid)) {
        const findedUsrInRetroBoardData =
          findedCurrentUserInRetroBoard.usersInRetroBoardData.find(usr => usr.userId === this.currentUser.uid);
        const arrayIndex = findedCurrentUserInRetroBoard.usersInRetroBoardData.indexOf(findedUsrInRetroBoardData);
        findedUsrInRetroBoardData.dateOfExistingCheck = currentDate.toString();
        findedCurrentUserInRetroBoard.usersInRetroBoardData[arrayIndex] = findedUsrInRetroBoardData;
        this.firestoreRetroInProgressService
          .updateCurrentUserInRetroBoard(findedCurrentUserInRetroBoard, findedCurrentUserInRetroBoardId);
      }
  }

  private createPersistentTimerOptions() {
    const timerOptionsToSave: TimerOption[] = [
      { value: 3, viewValue: '3 min' },
      { value: 5, viewValue: '5 min' },
      { value: 7, viewValue: '7 min' },
      { value: 10, viewValue: '10 min' },
      { value: 13, viewValue: '13 min' },
      { value: 15, viewValue: '15 min' },
      { value: 20, viewValue: '20 min' },
    ];

    timerOptionsToSave.forEach(timerOpt => {
      this.firestoreRetroInProgressService.addNewTimerOptions(timerOpt);
    });
  }

  private getTimerOptions() {
    this.timerOptions = new Array<TimerOption>();
    this.firestoreRetroInProgressService.getAllTimerOptions().then(timerOptionsSnapshot => {
      timerOptionsSnapshot.docs.forEach(timerOptDoc => {
        this.timerOptions.push(timerOptDoc.data() as TimerOption);
      });
      this.timerOptions.sort((a, b ) => a.value - b.value);
    });
  }

  private prepareRetroBoardCardToShowInAllActionView(retroBoardCards: RetroBoardCard[], retroBoardCardsToShow: RetroBoardCard[]) {
    const fliteredRetroBoardCard = retroBoardCards.filter(rtb => rtb.actions.some(a => a));
    fliteredRetroBoardCard.forEach(retroBoardCard => {
      retroBoardCardsToShow.push(retroBoardCard);
    });
  }

  private prepareBaseRetroBoardData() {
    // tslint:disable-next-line:no-string-literal
    if (this.route.snapshot.data['retroBoardData']) {
      this.getingDataAfterClickStartRetroProcess();
    } else {
      this.getingDataFromUrl();
    }
  }

  private getingDataFromUrl() {
    this.retroBoardParamIdSubscription = this.route.params.subscribe(params => {
      // tslint:disable-next-line:no-string-literal
      const retroBoardParamId: string = params['id'];

      this.firestoreRetroInProgressService.findRetroBoardByUrlParamId(retroBoardParamId).then(filteredRetroBoardsSnapshot => {
        if (filteredRetroBoardsSnapshot.docs.length > 0) {

          this.retroBoardSubscriptions =
          this.firestoreRetroInProgressService
            .findRetroBoardByUrlParamIdSnapshotChanges(retroBoardParamId).subscribe(retroBoardsSnapshot => {
              const findedRetroBoard = retroBoardsSnapshot[0].payload.doc.data() as RetroBoardToSave;
              this.retroBoardToProcess = findedRetroBoard;
              this.retroBoardToProcess.id = retroBoardsSnapshot[0].payload.doc.id as string;
              this.isRetroBoardIsReady = true;
              this.retroProcessIsStoped = findedRetroBoard.isFinished;

              this.checkIfCurrentUserIsInRetroBoardWorkspace(findedRetroBoard);
              this.checkIfCurrentUserIsJoinedToRetroBoardTeam(findedRetroBoard);
              this.setRetroBoardCardSubscription(this.retroBoardToProcess.id);
              this.setRetroBoardColumnCards();
              this.createAddNewRetroBoardCardForm();
              this.subscribeEvents();
              this.setUpTimerBaseSetting(this.retroBoardToProcess.id);

              this.addCurrentUserToRetroBoardProcess();
              this.setCurrentUserInRetroBoardSubscription();
              this.spinnerTick();
          });

        } else {
          // not finded any retro board
        }
      });
    });
  }

  private setCurrentUserInRetroBoardSubscription() {
    this.curentUserInRetroBoardSubscription =
      this.firestoreRetroInProgressService.findCurrentUserInRetroBoardIdSnapshotChanges(this.retroBoardToProcess.id)
        .subscribe(currentUsersInRetroBoardSnapshot => {
          const findedCurrentUserInRetroBoard = currentUsersInRetroBoardSnapshot[0].payload.doc.data() as CurrentUsersInRetroBoardToSave;
          this.currentUsersInRetroBoard = {
            retroBoardId: this.retroBoardToProcess.id,
            users: new Array<User>()
          };
          this.currentUsersInRetroBoardCount = findedCurrentUserInRetroBoard.usersInRetroBoardData.length;
          findedCurrentUserInRetroBoard.usersInRetroBoardData.forEach(userInRetroBoardData => {
            this.firestoreRetroInProgressService.getUserById(userInRetroBoardData.userId).then(usersSnapshot => {
              const findedUser = usersSnapshot.data() as User;
              this.currentUsersInRetroBoard.users.push(findedUser);
            });
          });
      });
  }

  private addCurrentUserToRetroBoardProcess() {
    this.firestoreRetroInProgressService.getCurrentUserInRetroBoard(this.retroBoardToProcess.id)
      .then(currentUserInRetroBoardSnapshot => {
        const findedCurrentUserInRetroBoard = currentUserInRetroBoardSnapshot.docs[0].data() as CurrentUsersInRetroBoardToSave;
        const findedCurrentUserInRetroBoardId = currentUserInRetroBoardSnapshot.docs[0].id as string;

        if (findedCurrentUserInRetroBoard.usersInRetroBoardData.length === 0) {
          const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
          const userDataToAdd: UserInRetroBoardData = {
            userId: this.currentUser.uid,
            dateOfExistingCheck: currentDate.toString()
          };

          findedCurrentUserInRetroBoard.usersInRetroBoardData.push(userDataToAdd);
          this.firestoreRetroInProgressService
            .updateCurrentUserInRetroBoard(findedCurrentUserInRetroBoard, findedCurrentUserInRetroBoardId);
        } else if (!findedCurrentUserInRetroBoard.usersInRetroBoardData.some(usr => usr.userId === this.currentUser.uid)) {
          const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
          const userDataToAdd: UserInRetroBoardData = {
            userId: this.currentUser.uid,
            dateOfExistingCheck: currentDate.toString()
          };

          findedCurrentUserInRetroBoard.usersInRetroBoardData.push(userDataToAdd);
          this.firestoreRetroInProgressService
            .updateCurrentUserInRetroBoard(findedCurrentUserInRetroBoard, findedCurrentUserInRetroBoardId);
        }
      });
  }

  private removeCurrentUserToRetroBoardProcess(userInRetroBoardId: string) {

    this.firestoreRetroInProgressService.getCurrentUserInRetroBoard(this.retroBoardToProcess.id)
      .then(currentUserInRetroBoardSnapshot => {
        const findedCurrentUserInRetroBoard = currentUserInRetroBoardSnapshot.docs[0].data() as CurrentUsersInRetroBoardToSave;
        const findedCurrentUserInRetroBoardId = currentUserInRetroBoardSnapshot.docs[0].id as string;

        const userToRemove = findedCurrentUserInRetroBoard.usersInRetroBoardData.find(usr => usr.userId === userInRetroBoardId);
        const indexToRemove = findedCurrentUserInRetroBoard.usersInRetroBoardData.indexOf(userToRemove);
        findedCurrentUserInRetroBoard.usersInRetroBoardData.splice(indexToRemove, 1);

        this.firestoreRetroInProgressService
          .updateCurrentUserInRetroBoard(findedCurrentUserInRetroBoard, findedCurrentUserInRetroBoardId);
      });
  }

  private checkIfCurrentUserIsJoinedToRetroBoardTeam(findedRetroBoard: RetroBoardToSave) {
    if (!this.userIsNotInCurrentRetroBoardWorkspace) {
      findedRetroBoard.team.get().then(teamSnapshot => {
        const findedTeamId = teamSnapshot.id as string;
        const teamName = (teamSnapshot.data() as Team).name;
        this.firestoreRetroInProgressService.getUserTeams(this.currentUser.uid).then(userTeamsSnapshot => {
          userTeamsSnapshot.docs.forEach(userTeamDoc => {
            const findedUserTeamData = userTeamDoc.data();
            let currentLenghtIndex = 1;
            let isUserInCurrentRetroBoardTeam = false;
            findedUserTeamData.teams.forEach(teamRef => {
              teamRef.get().then(teamDoc => {
                const findedUserTeam = teamDoc.data() as Team;
                findedUserTeam.id = teamDoc.id as string;
                if (findedUserTeam.id === findedTeamId) {
                  isUserInCurrentRetroBoardTeam = true;
                }
                if (currentLenghtIndex === findedUserTeamData.teams.length) {
                  if (!isUserInCurrentRetroBoardTeam) {
                    this.userIsNotInCurrentRetroBoardTeam = true;
                    this.openDialogForJoinToExistingTeam(teamName);
                  }
                }
                currentLenghtIndex++;
              });
             });
          });
        });
      });
    }
  }

  private openDialogForJoinToExistingTeam(teamName: string) {
    const dialogRef = this.dialog.open(TeamRetroInProgressUserWithoutRbTeamDialogComponent, {
      width: '750px',
      data: { teamName }
    });
    dialogRef.afterClosed().subscribe(result => {
      const isUserWantToJoinToRetroBoardTeam = result;
      if (isUserWantToJoinToRetroBoardTeam) {
        this.addUserToExistingTeam();
        this.userIsNotInCurrentRetroBoardTeam = false;
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private addUserToExistingTeam() {
    this.retroBoardToProcess.team.get().then(teamSnapshot => {
      const currentRetroBoardTeamId = teamSnapshot.id as string;
      this.firestoreRetroInProgressService.getUserTeams(this.currentUser.uid).then(userTeamsSnapshot => {
        userTeamsSnapshot.docs.forEach(userTeamDoc => {
          const findedUserTeamData = userTeamDoc.data() as UserTeamsToSave;
          const findedUserTeamId = userTeamDoc.id;
          findedUserTeamData.teams.push(this.firestoreRetroInProgressService.addTeamAsRef(currentRetroBoardTeamId));
          this.firestoreRetroInProgressService.updateUserTeams(findedUserTeamData, findedUserTeamId);
        });
      });
    });
  }

  private setUpTimerBaseSetting(retroBoardId: string) {
    this.firestoreRetroInProgressService.getFilteredTimerSettingForCurrentRetroBoard(retroBoardId).then(timerSettingsSnapshot => {
      if (timerSettingsSnapshot.docs.length === 0) {
        const timerSetting: TimerSettingToSave = {
          chosenTimerOpt: {},
          // tslint:disable-next-line:object-literal-shorthand
          retroBoardId: retroBoardId,
          isStarted: false
        };
        this.firestoreRetroInProgressService.addNewTimerSettingForRetroBoard(timerSetting).then(newTimerSettingSnapshot => {
          newTimerSettingSnapshot.get().then(newTimerSettingDocs => {
            const newTimerSettingId = newTimerSettingDocs.id;
            this.eventsService.emitNewTimerSetting(newTimerSettingId);
          });
        });
      } else if (timerSettingsSnapshot.docs.length === 1) {
        const timerSettingId = timerSettingsSnapshot.docs[0].id;
        this.eventsService.emitNewTimerSetting(timerSettingId);
      }
    });
  }

  private setRetroBoardCardSubscription(retroBoardId: string) {
    this.retroBoardCardsSubscriptions =
      this.firestoreRetroInProgressService.retroBoardCardsFilteredByRetroBoardIdSnapshotChanges(retroBoardId)
        .subscribe(retroBoardCardsSnapshot => {
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
    // tslint:disable-next-line:no-string-literal
    const retroBoardDataSnapshot = this.route.snapshot.data['retroBoardData'] as RetroBoardToSave;

    this.firestoreRetroInProgressService.findRetroBoardByUrlParamId(retroBoardDataSnapshot.urlParamId).then(filteredRetroBoardSnapshot => {
      if (filteredRetroBoardSnapshot.docs.length > 0) {
        this.firestoreRetroInProgressService.findRetroBoardByUrlParamIdSnapshotChanges(retroBoardDataSnapshot.urlParamId)
          .subscribe(retroBoardsSnapshot => {
            const findedRetroBoard = retroBoardsSnapshot[0].payload.doc.data() as RetroBoardToSave;
            this.retroBoardToProcess = findedRetroBoard;
            this.retroBoardToProcess.id = retroBoardsSnapshot[0].payload.doc.id as string;
            this.retroBoardData = this.retroBoardToProcess;
            this.isRetroBoardIsReady = true;
            this.retroProcessIsStoped = findedRetroBoard.isFinished;

            this.setRetroBoardColumnCards();
            this.createAddNewRetroBoardCardForm();
            this.subscribeEvents();
            this.setRetroBoardCardSubscription(this.retroBoardToProcess.id);
            this.setUpTimerBaseSetting(this.retroBoardToProcess.id);
            this.addCurrentUserToRetroBoardProcess();
            this.setCurrentUserInRetroBoardSubscription();

            this.spinnerTick();
        });
      } else {
        // if url not exisis
      }
    });
  }

  private checkIfCurrentUserIsInRetroBoardWorkspace(findedRetroBoard: RetroBoardToSave) {
    const isUsertInRetroBoardWorkspace = this.userWorkspace.workspaces.some(x => x.workspace.id === findedRetroBoard.workspaceId);
    if (!isUsertInRetroBoardWorkspace) {
      this.userIsNotInCurrentRetroBoardWorkspace = true;
      this.firestoreRetroInProgressService.findWorkspaceById(findedRetroBoard.workspaceId).then(workspacesSnapshot => {
        findedRetroBoard.team.get().then(teamSnapshot => {
          const findedUserTeam = teamSnapshot.data() as Team;
          const findedWorkspace = workspacesSnapshot.data() as Workspace;
          this.openDialogAboutUserWorkspaces(findedWorkspace, findedRetroBoard, findedUserTeam);
        });
      });
    }
  }

  private openDialogAboutUserWorkspaces(findedWorkspace: Workspace, findedRetroBoard: RetroBoardToSave, retroBoardTeam: Team) {
    const dialogRef = this.dialog.open(TeamRetroInProgressUserWithoutRbWorkspaceDialogComponent, {
      width: '750px',
      data: {workspaceName: findedWorkspace.name, teamName: retroBoardTeam.name}
    });
    dialogRef.afterClosed().subscribe(result => {
      const isUserJoinToRetroBoardWorkspace = result;
      if (isUserJoinToRetroBoardWorkspace) {
        this.addUserWorkspacesWithTeam(findedRetroBoard.workspaceId);
        this.userIsNotInCurrentRetroBoardWorkspace = false;
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private addUserWorkspacesWithTeam(workspaceId: string) {
    this.firestoreRetroInProgressService.findUserWorkspacesById(this.userWorkspace.id).then(userWorkspaceSnapshot => {
      if (!this.userIsNotInCurrentRetroBoardWorkspace) {
        this.retroBoardToProcess.team.get().then(teamSnapshot => {
          const retroBoardTeamId = teamSnapshot.id as string;

          this.firestoreRetroInProgressService.getUserTeams(this.currentUser.uid).then(userTeamsSnapshot => {
            userTeamsSnapshot.docs.forEach(userTeamDoc => {
              const findedUserTeamData = userTeamDoc.data() as UserTeamsToSave;
              const findedUserTeamId = userTeamDoc.id;
              findedUserTeamData.teams.push(this.firestoreRetroInProgressService.addTeamAsRef(retroBoardTeamId));
              this.firestoreRetroInProgressService.updateUserTeams(findedUserTeamData, findedUserTeamId);

              const findedUserWorkspace = userWorkspaceSnapshot.data() as UserWorkspaceToSave;
              this.changeUserWorkspaceIsCurrentState(findedUserWorkspace);
              this.addNewUserWorkspaceAsCurrent(workspaceId, findedUserWorkspace);
              this.prepareUserWorkspace(findedUserWorkspace);
            });
          });
        });
      }


    });
  }

  private prepareUserWorkspace(findedUserWorkspace) {
    const userWorkspace: UserWorkspace = this.createUserWorkspace(this.currentUser);
    this.firestoreRetroInProgressService.getUserWorkspace(this.currentUser.uid).then(userWorksapcesSnapshot => {
      if (userWorksapcesSnapshot.docs.length > 0) {
        userWorksapcesSnapshot.docs.forEach(userWorkspaceDoc => {
          const findedUserWorkspaceToSave = userWorkspaceDoc.data();
          userWorkspace.id = userWorkspaceDoc.id;
          findedUserWorkspaceToSave.workspaces.forEach(worskspaceData => {
            worskspaceData.workspace.get().then(findedUserWorkspaceToSaveDoc => {
              const userWorkspacesData = findedUserWorkspaceToSaveDoc.data() as Workspace;
              userWorkspacesData.id = findedUserWorkspaceToSaveDoc.id;
              const userWorkspacesDataToAdd: UserWorkspaceData = {
                workspace: userWorkspacesData,
                isCurrent: worskspaceData.isCurrent
              };

              userWorkspace.workspaces.push(userWorkspacesDataToAdd);
              this.localStorageService.removeItem('userWorkspace');
              this.localStorageService.setItem('userWorkspace', userWorkspace);

              findedUserWorkspace.workspaces.find(uw => uw.isCurrent).workspace.get().then(currWokrspaceSnapshot => {
                const currentWorkspaceToAdd = currWokrspaceSnapshot.data() as Workspace;
                this.currentWorkspace = currentWorkspaceToAdd;
                this.eventsService.emitSetNewCurrentWorkspaceEmiter(this.currentWorkspace);
              });
            });
          });
        });
      }
    });
  }

  private createUserWorkspace(currentUser): UserWorkspace {
    return {
      id: '',
      user: currentUser,
      workspaces: new Array<UserWorkspaceData>()
    };
  }


  private addNewUserWorkspaceAsCurrent(workspaceId: string, findedUserWorkspace: UserWorkspaceToSave) {
    const userWorkspaceDataToSave: UserWorkspaceDataToSave = {
      isCurrent: true,
      workspace: this.firestoreRetroInProgressService.addWorkspaceAsRef(workspaceId)
    };
    findedUserWorkspace.workspaces.push(userWorkspaceDataToSave);
    this.firestoreRetroInProgressService.updateUserWorkspaces(findedUserWorkspace, this.userWorkspace.id);
  }

  private changeUserWorkspaceIsCurrentState(findedUserWorkspace: UserWorkspaceToSave) {
    const findedCurrentWorkspaceDataToChange = findedUserWorkspace.workspaces.find(uw => uw.isCurrent);
    findedCurrentWorkspaceDataToChange.isCurrent = false;
    this.firestoreRetroInProgressService.updateUserWorkspaces(findedUserWorkspace, this.userWorkspace.id);
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
      retroBoardId: card.retroBoardId,
      userId: this.currentUser.uid,
      voteCount: card.voteCount,
      actions: new Array<any>()
    };

    return cardToSave;
  }

  private prepareRetroBoardCardToSaveFromMerged(mergedCard: MergedRetroBoardCard, isWentWellRetroBoradCol: boolean, index: number) {
    return {
      name: mergedCard.name,
      userId: mergedCard.userId,
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
      voteCount: card.voteCount,
      retroBoardId: card.retroBoardId
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
      retroBoardId: this.retroBoardToProcess.id,
      userId: this.currentUser.uid,
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
    return { name: retroBoardCard.name, userId: retroBoardCard.userId };
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

    this.timerIsFinsihedSubscriptions = this.eventsService.getTimerIsFinishedEmiter().subscribe(() => this.timerIsRunning = false);
  }
}
