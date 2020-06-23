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
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { CurrentUserInRetroBoardDataToDisplay } from 'src/app/models/CurrentUserInRetroBoardDataToDisplay';
import { CurrentUserVotes } from 'src/app/models/currentUserVotes';
import { UserTeams } from 'src/app/models/userTeams';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressRetroBoardOptionsDialogComponent } from '../team-retro-in-progress-retro-board-options-dialog/team-retro-in-progress-retro-board-options-dialog-component';
import { RetroBoardOptions } from 'src/app/models/retroBoardOptions';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';
import { RetroBoardAdditionalInfoToSave } from 'src/app/models/retroBoardAdditionalInfoToSave';
import { TeamRetroInProgressShowPreviousActionsDialogComponent } from '../team-retro-in-progress-show-previous-actions-dialog/team-retro-in-progress-show-previous-actions-dialog.component';

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

  currentUsersInRetroBoard: CurrentUserInRetroBoardDataToDisplay[];
  currentUsersInRetroBoardCount = 0;
  curentUserInRetroBoardSubscription: any;
  tickSubscription: any;
  actualMaxRetroBoardVotes = 0;
  actualCountOfUserVotes = 0;
  previousRetroBoardToShowActionsDocId: string;
  shouldShowPreviousActionBtn: boolean;

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
    private spinnerTickService: SpinnerTickService,
    private currentUserInRetroBoardApiService: CurrentUserApiService) {}

  private wnetWellRetroBoardCol: Column;
  private toImproveRetroBoardCol: Column;

  sortByData = new Array<string>();

  public board: Board;
  private retroBoardToProcess: RetroBoardToSave;
  public isRetroBoardIsReady = false;
  public isExistingSomeRetroBoardCardAction = false;

  public usersVotesInRetroBoard: CurrentUserVotes[];

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

  public retroBoardOptions: RetroBoardOptions;

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
    this.sortByData.push('name');
    this.sortByData.push('voute count');

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

    this.getCurrentRetroBoardTeamPromise().then(teamSnapshot => {
      const teamId = teamSnapshot.id as string;

      const dialogRef = this.dialog.open(TeamRetroInProgressShowActionDialogComponent, {
        width: '1100px',
        data: {currentCard, retroBoardId: this.retroBoardToProcess.id, workspaceId: this.currentWorkspace.id, teamId}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {}
      });
    });

  }

  openAllCardActionDialog() {
    const retroBoardCardToShow = new Array<RetroBoardCard>();
    this.prepareRetroBoardCardToShowInAllActionView(this.wnetWellRetroBoardCol.retroBoardCards, retroBoardCardToShow);
    this.prepareRetroBoardCardToShowInAllActionView(this.toImproveRetroBoardCol.retroBoardCards, retroBoardCardToShow);

    retroBoardCardToShow.concat(this.toImproveRetroBoardCol.retroBoardCards);

    this.getCurrentRetroBoardTeamPromise().then(teamSnapshot => {
      const teamId = teamSnapshot.id as string;
      const dialogRef = this.dialog.open(TeamRetroInProgressShowAllActionsDialogComponent, {
        width: '1100px',
        data: {retroBoardCardToShow, retroBoardId: this.retroBoardToProcess.id, workspaceId: this.currentWorkspace.id, teamId}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {}
      });
    });
  }

  openPreviousCardActionDialog() {
    this.getCurrentRetroBoardTeamPromise().then(teamSnapshot => {
      const teamId = teamSnapshot.id as string;
      const dialogRef = this.dialog.open(TeamRetroInProgressShowPreviousActionsDialogComponent, {
        width: '1100px',
        data: {
          previousRetroBoardToShowActionsDocId: this.previousRetroBoardToShowActionsDocId,
          workspaceId: this.currentWorkspace.id,
          teamId
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {}
      });
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
      this.removeUserVoteOnCardForMerge(currentCard);
      this.firestoreRetroInProgressService.removeRetroBoardCard(currentCard.id);
    }
  }

  onVoteCard(currentCard: RetroBoardCard) {
    currentCard.isClickedFromVoteBtn = true;
    this.currentUserInRetroBoardApiService.getUserVoteCount(this.currentUser.uid, this.retroBoardToProcess.id).then(response => {
      const userVoteCount = response;
      if (userVoteCount >= 6) {
        this.openSnackBar('you are currently used all 6 votes');
      } else {
        this.firestoreRetroInProgressService.findRetroBoardCardById(currentCard.id).then(findedRetroBoardCardDoc => {
          const findedRetroBoardCard = findedRetroBoardCardDoc.data() as RetroBoardCard;
          const findedRetroBoardCardDocId = findedRetroBoardCardDoc.id;
          findedRetroBoardCard.voteCount++;
          const cardToUpdate = this.prepareRetroBoardCardToUpdate(findedRetroBoardCard);
          this.firestoreRetroInProgressService.updateRetroBoardCard(cardToUpdate, findedRetroBoardCardDocId);
          this.currentUserInRetroBoardApiService.addUserVoteOnCard(this.currentUser.uid, this.retroBoardToProcess.id, currentCard.id)
            .then(() => {
              this.getUsersVotes();
            })
            .catch(error => {});
        });
      }

    }).catch(error => {
      const err = error;
    });

  }

  onRemoveCurrentUserVote(currentCard: RetroBoardCard) {
    currentCard.isClickedFromExistingVoteBtn = true;
    this.removeCurrentUserVote(currentCard);
  }

  private removeCurrentUserVote(currentCard: RetroBoardCard) {
    this.currentUserInRetroBoardApiService.removeCurrentUserVote(currentCard.id, this.currentUser.uid, this.retroBoardToProcess.id)
      .then(() => {
        this.firestoreRetroInProgressService.findRetroBoardCardById(currentCard.id).then(findedRetroBoardCardDoc => {
          if (findedRetroBoardCardDoc.exists) {
            const findedRetroBoardCard = findedRetroBoardCardDoc.data() as RetroBoardCard;
            const findedRetroBoardCardDocId = findedRetroBoardCardDoc.id;
            findedRetroBoardCard.voteCount = findedRetroBoardCard.voteCount - 1;
            const cardToUpdate = this.prepareRetroBoardCardToUpdate(findedRetroBoardCard);
            this.firestoreRetroInProgressService.updateRetroBoardCard(cardToUpdate, findedRetroBoardCardDocId);
          }
          this.getUsersVotes();
        });
      })
      .catch(error => {
        const err = error;
      });
  }

  prepareCurrentVoteList(currentCard: RetroBoardCard) {
    if (this.usersVotesInRetroBoard !== undefined) {
      const filteredUsersVotes =
      this.usersVotesInRetroBoard.filter(x => x.retroBoardCardId === currentCard.id && x.userId === this.currentUser.uid);

      const usersVotesToReturn = new Array<CurrentUserVotes>();
      let positionForMargin = 10;
      filteredUsersVotes.forEach(usrVote => {
        usrVote.positionForMargin = positionForMargin;
        positionForMargin = positionForMargin + 17;
        usersVotesToReturn.push(usrVote);
      });
      return usersVotesToReturn;
    }
  }

  private getUsersVotes() {
    this.currentUserInRetroBoardApiService.getUsersVote(this.retroBoardToProcess.id)
      .then(response => {
        this.usersVotesInRetroBoard = response;
        this.prepareActualUserVoteCount();
      })
      .catch(error => {
        const err = error;
      });
  }

  prepareActualUserVoteCount() {
    const actualMaxRetroBoardVotes = this.currentUsersInRetroBoardCount * 6;
    const actualCountOfUserVotes = this.usersVotesInRetroBoard.length;

    this.actualMaxRetroBoardVotes = actualMaxRetroBoardVotes;
    this.actualCountOfUserVotes = actualCountOfUserVotes;
  }

  onAddActionToCard(currentCard: RetroBoardCard) {
    currentCard.isClickedFromAddActionBtn = true;
    currentCard.isInAddedToAction = true;
    const bottomSheetRef = this.bottomSheetRef.open(AddNewActionBottomsheetComponent, {
      data: currentCard
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      console.log('Bottom sheet has been dismissed.');
      currentCard.isInAddedToAction = false;

      if (result.addedNewActionSuccessfully) {
        this.addedAdditionalInfoWithCurrentActionCountInRetroBoard();
      }
    });
  }

  private addedAdditionalInfoWithCurrentActionCountInRetroBoard() {
    this.getCurrentRetroBoardTeamPromise().then(teamSnapshot => {
      const teamId = teamSnapshot.id as string;
      this.firestoreRetroInProgressService.retroBoardCardActionsFilteredByRetroBoardId(this.retroBoardToProcess.id)
        .then(retroBoardActionSnapshot => {
          const countOfRetroBoardActions = retroBoardActionSnapshot.docs.length;
          const retroBoardAdditionalInfo: RetroBoardAdditionalInfoToSave = {
            retroBoardFirebaseDocId: this.retroBoardToProcess.id,
            teamFirebaseDocId: teamId,
            workspaceFirebaseDocId: this.currentWorkspace.id
          };
          this.currentUserInRetroBoardApiService
            .addRetroBoardAdditionalInfoWithActionCount(countOfRetroBoardActions, retroBoardAdditionalInfo)
            .then(() => {})
            .catch(error => {
              const err = error;
            });
        });
    });
  }

  onOpenShowAllCurrentUsersInRetro() {
    this.openShowAllCurrentUsersInRetroDialog();
  }

  onOpenRetroBoardOptions() {
    this.openRetroBoardOptionsDialog();
  }

  ShouldBlurRetroBoardCardText(currentRetroBoardCard: RetroBoardCard) {
    if (this.retroBoardOptions !== undefined) {
      if (currentRetroBoardCard.userId !== this.currentUser.uid && this.retroBoardOptions.shouldBlurRetroBoardCardText) {
        return true;
      }
    }

    return false;
  }

  shouldHideUserVouteCountOnRetroBoardCard(currentRetroBoardCard: RetroBoardCard) {
    if (this.retroBoardOptions !== undefined) {
      if (this.shouldEnableVoteBtns && this.retroBoardOptions.shouldHideVoutCountInRetroBoardCard) {
        return true;
      }
    }
    return false;
  }

  private openRetroBoardOptionsDialog() {
    const dialogRef = this.dialog.open(TeamRetroInProgressRetroBoardOptionsDialogComponent, {
      width: '600px',
      data: {retroBoard: this.retroBoardToProcess, retroBoardOptions: this.retroBoardOptions}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.freshRetroBoardOptions !== undefined && result.freshRetroBoardOptions !== null) {
          this.retroBoardOptions = result.freshRetroBoardOptions;

          const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
          const retroBoardToUpdate = {retroBoardOptionsChangeDate: currentDate, lastModifiedDate: currentDate};
          this.firestoreRetroInProgressService.updateRetroBoard(retroBoardToUpdate, this.retroBoardToProcess.id);
        }
      }
    });
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

  onChangeSort(eventValue) {
    if (eventValue !== undefined && eventValue !== null) {
      const sortByValue = eventValue as string;

      if (sortByValue !== null) {
        if (sortByValue === 'name') {
          this.sortByAsc();
        } else if (sortByValue === 'voute count') {
          this.sortByVoteCountDesc();
        }
      }
    } else {
      this.sortByIndexValue();
    }
  }

  sortByDesc() {
    this.wnetWellRetroBoardCol.retroBoardCards.sort((leftSide, rightSide): number => {
      if (leftSide.name > rightSide.name) { return -1; }
      if (leftSide.name < rightSide.name) { return 1; }

      return 0;
    });

    this.toImproveRetroBoardCol.retroBoardCards.sort((leftSide, rightSide): number => {
      if (leftSide.name > rightSide.name) { return -1; }
      if (leftSide.name < rightSide.name) { return 1; }

      return 0;
    });
  }

  sortByAsc() {
    this.wnetWellRetroBoardCol.retroBoardCards.sort((leftSide, rightSide): number => {
      if (leftSide.name < rightSide.name) { return -1; }
      if (leftSide.name > rightSide.name) { return 1; }

      return 0;
    });

    this.toImproveRetroBoardCol.retroBoardCards.sort((leftSide, rightSide): number => {
      if (leftSide.name < rightSide.name) { return -1; }
      if (leftSide.name > rightSide.name) { return 1; }

      return 0;
    });
  }

  sortByVoteCountDesc() {
    this.wnetWellRetroBoardCol.retroBoardCards.sort((leftSide, rightSide): number => {
      if (leftSide.voteCount > rightSide.voteCount) { return -1; }
      if (leftSide.voteCount < rightSide.voteCount) { return 1; }

      return 0;
    });

    this.toImproveRetroBoardCol.retroBoardCards.sort((leftSide, rightSide): number => {
      if (leftSide.voteCount > rightSide.voteCount) { return -1; }
      if (leftSide.voteCount < rightSide.voteCount) { return 1; }

      return 0;
    });
  }

  sortByIndexValue() {
    this.wnetWellRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);
    this.toImproveRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);
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
      currentCard.isClickedFromShowActionBtn ||
      currentCard.isClickedFromExistingVoteBtn) {
        currentCard.isClickedFromVoteBtn = false;
        currentCard.isClickedFromMergeBtn = false;
        currentCard.isClickedFromAddActionBtn = false;
        currentCard.isClickedFromShowActionBtn = false;
        currentCard.isClickedFromExistingVoteBtn = false;
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

  removeRetroBoardCard(currentCard: RetroBoardCard) {
    currentCard.isInDeleting = true;
    this.firestoreRetroInProgressService.removeRetroBoardCard(currentCard.id);
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
          if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
            this.currentUserInRetroBoardApiService.regeneraTokenPromise()
              .then(refreshedTokenResponse => {
                this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
                this.prepareFreshListOfCurrentUserVote();
              });
          } else {
            this.prepareFreshListOfCurrentUserVote();
          }
          currentValue = 0;
        }
      });
  }

  private prepareFreshListOfCurrentUserVote() {
    this.currentUserInRetroBoardApiService
      .prepareFreshListOfCurrentUsersInRetroBoard(this.retroBoardToProcess.id, this.currentUser.uid)
      .then(response => {
        this.setAllCurrentUsersInRetroBoardProcess();
      })
      .catch(error => { });
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
              this.spinnerTick();
              this.setAllCurrentUsersInRetroBoardProcess();
              this.getUsersVotes();
              this.getRetroBoardOptions();
              this.getPreviousRetroBoardDocId();

              // this.firestoreRetroInProgressService.findCurrentUserVoutes(this.currentUser.uid).subscribe(currentUserVotesSnapshot => {
              //   const currentUserVotes = currentUserVotesSnapshot[0].payload.doc.data();
              // });
          });

        } else {
          // not finded any retro board
        }
      });
    });
  }

  private getRetroBoardOptions() {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getRetroBoardOptionsForInitPage();
      });
    } else {
      this.getRetroBoardOptionsForInitPage();
    }
  }

  private getRetroBoardOptionsForInitPage() {
    this.currentUserInRetroBoardApiService.getRetroBoardOptions(this.retroBoardToProcess.id).then(rboResponse => {
      this.retroBoardOptions = rboResponse;
    })
    .catch(error => {
      const err = error;
    });
  }

  private setAllCurrentUsersInRetroBoardProcess() {
    this.currentUserInRetroBoardApiService.getCurrentUserInRetroBoard(this.retroBoardToProcess.id).then(response => {
      const currentUsersInRetroBoardToDisplay = response;
      this.currentUsersInRetroBoard = currentUsersInRetroBoardToDisplay;
      this.currentUsersInRetroBoardCount = response.length;
      this.prepareActualUserVoteCount();
    }).catch(error => {

    });
  }

  private addCurrentUserToRetroBoardProcess() {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.addCurrentUserAfterInitInPage();
      });
    } else {
      this.addCurrentUserAfterInitInPage();
    }
  }

  private addCurrentUserAfterInitInPage() {
    this.currentUserInRetroBoardApiService.addCurrentUserToRetroBoardProcess(this.currentUser, this.retroBoardToProcess.id)
      .then(response => {
        this.setAllCurrentUsersInRetroBoardProcess();
      });
  }

  private getPreviousRetroBoardDocId() {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getPreviousRetroBoardIdInitInPage();
      });
    } else {
      this.getPreviousRetroBoardIdInitInPage();
    }
  }

  private getPreviousRetroBoardIdInitInPage() {
    this.getCurrentRetroBoardTeamPromise().then(teamSnapshot => {
      const currentRetroBoardTeamId = teamSnapshot.id as string;
      this.currentUserInRetroBoardApiService
      .getPreviousRetroBoardId(this.retroBoardToProcess.id, this.currentWorkspace.id, currentRetroBoardTeamId)
        .then(response => {
          if (response !== null && response !== '') {
            if (response.previousRetroBoardDocId !== undefined &&
                response.previousRetroBoardDocId !== null &&
                response.previousRetroBoardDocId !== '' &&
                response.shouldShowPreviousActionsButton) {
                  this.previousRetroBoardToShowActionsDocId = response.previousRetroBoardDocId;
                  this.shouldShowPreviousActionBtn = true;
            } else {
              this.shouldShowPreviousActionBtn = false;
            }
          }
        })
        .catch(error => {
          const err = error;
        });
    });
  }

  private getCurrentRetroBoardTeamPromise() {
    return this.retroBoardToProcess.team.get();
  }

  private checkIfCurrentUserIsJoinedToRetroBoardTeam(findedRetroBoard: RetroBoardToSave) {
    if (!this.userIsNotInCurrentRetroBoardWorkspace) {
      findedRetroBoard.team.get().then(teamSnapshot => {
        const findedTeamId = teamSnapshot.id as string;
        const teamName = (teamSnapshot.data() as Team).name;
        this.firestoreRetroInProgressService.getUserTeams(this.currentUser.uid).then(userTeamsSnapshot => {
          if (userTeamsSnapshot.docs.length > 0) {
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
          } else {
            this.userIsNotInCurrentRetroBoardTeam = true;
            this.openDialogForJoinToExistingTeam(teamName);
          }

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
        if (userTeamsSnapshot.docs.length > 0) {
          userTeamsSnapshot.docs.forEach(userTeamDoc => {
            const findedUserTeamData = userTeamDoc.data() as UserTeamsToSave;
            const findedUserTeamId = userTeamDoc.id;
            findedUserTeamData.teams.push(this.firestoreRetroInProgressService.addTeamAsRef(currentRetroBoardTeamId));
            this.firestoreRetroInProgressService.updateUserTeams(findedUserTeamData, findedUserTeamId);
          });
        } else {
          const userTeamsToSave: UserTeamsToSave = {
            userId: this.currentUser.uid,
            teams: [this.firestoreRetroInProgressService.addTeamAsRef(currentRetroBoardTeamId)]
          };
          this.firestoreRetroInProgressService.addNewUserTeams(userTeamsToSave);
        }
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

          if (this.wnetWellRetroBoardCol.retroBoardCards.some(rbc => rbc.isEdit && !rbc.isInDeleting)) {
            const findedEditedRBCard = this.wnetWellRetroBoardCol.retroBoardCards.find(rbc => rbc.isEdit);
            this.wnetWellRetroBoardCol.retroBoardCards = this.clearRetroBoardCardsLocalArray();
            this.wnetWellRetroBoardCol.retroBoardCards.push(findedEditedRBCard);
          } else {
            this.wnetWellRetroBoardCol.retroBoardCards = this.clearRetroBoardCardsLocalArray();
          }

          if (this.toImproveRetroBoardCol.retroBoardCards.some(rbc => rbc.isEdit && !rbc.isInDeleting)) {
            const findedEditedRBCard = this.toImproveRetroBoardCol.retroBoardCards.find(rbc => rbc.isEdit);
            this.toImproveRetroBoardCol.retroBoardCards = this.clearRetroBoardCardsLocalArray();
            this.toImproveRetroBoardCol.retroBoardCards.push(findedEditedRBCard);
          } else {
            this.toImproveRetroBoardCol.retroBoardCards = this.clearRetroBoardCardsLocalArray();
          }

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
      this.wnetWellRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);
    } else {
      this.toImproveRetroBoardCol.retroBoardCards.push(retroBoardCard);
      this.toImproveRetroBoardCol.retroBoardCards.sort((a, b ) => b.index - a.index);
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

            this.checkIfCurrentUserIsInRetroBoardWorkspace(findedRetroBoard);
            this.checkIfCurrentUserIsJoinedToRetroBoardTeam(findedRetroBoard);
            this.setRetroBoardColumnCards();
            this.createAddNewRetroBoardCardForm();
            this.subscribeEvents();
            this.setRetroBoardCardSubscription(this.retroBoardToProcess.id);
            this.setUpTimerBaseSetting(this.retroBoardToProcess.id);
            this.addCurrentUserToRetroBoardProcess();
            this.spinnerTick();
            this.setAllCurrentUsersInRetroBoardProcess();
            this.getUsersVotes();
            this.getRetroBoardOptions();
            this.getPreviousRetroBoardDocId();
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
            if (userTeamsSnapshot.docs.length > 0) {
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
            } else {
              const findedUserWorkspace = userWorkspaceSnapshot.data() as UserWorkspaceToSave;
              this.changeUserWorkspaceIsCurrentState(findedUserWorkspace);
              this.addNewUserWorkspaceAsCurrent(workspaceId, findedUserWorkspace);
              this.prepareUserWorkspace(findedUserWorkspace);

              const userTeamsToSave: UserTeamsToSave = {
                userId: this.currentUser.uid,
                teams: [this.firestoreRetroInProgressService.addTeamAsRef(retroBoardTeamId)]
              };

              this.firestoreRetroInProgressService.addNewUserTeams(userTeamsToSave);
            }
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
      actions: new Array<any>(),
      retroBoardId: this.retroBoardToProcess.id
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
      isClickedFromExistingVoteBtn: false,
      isClickedFromAddActionBtn: false,
      isInAddedToAction: false,
      isClickedFromShowActionBtn: false,
      isInMerge: false,
      isInDeleting: false,
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
        this.removeUserVoteOnCardForMerge(findedFromMergedCart);
        this.removeUserVoteOnCardForMerge(findedCurrentRetroBoardCard);
      }
  }

  private removeUserVoteOnCardForMerge(currentCard: RetroBoardCard) {
    if (currentCard.voteCount > 0) {
      this.currentUserInRetroBoardApiService
        .removeCurrentUserVoteForMerge(currentCard.id, this.currentUser.uid, this.retroBoardToProcess.id, currentCard.voteCount)
          .then(() => {
            this.getUsersVotes();
          })
          .catch(error => {
            const err = error;
          });
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
