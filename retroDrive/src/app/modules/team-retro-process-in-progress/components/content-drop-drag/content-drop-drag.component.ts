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
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressShowPreviousActionsDialogComponent } from '../team-retro-in-progress-show-previous-actions-dialog/team-retro-in-progress-show-previous-actions-dialog.component';
import { RetroBoardStatus } from 'src/app/models/retroBoardStatus';
import { RetroBoardApi } from 'src/app/models/retroBoardApi';
import { RetroBoardCardApi } from 'src/app/models/retroBoardCardApi';
import { RetroBoardCardApiToSave } from 'src/app/models/retroBoardCardApiToSave';
import { RetroBoardCardApiGet } from 'src/app/models/retroBoardCardApiGet';
import { Spinner } from 'ngx-spinner/lib/ngx-spinner.enum';

import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs/internal/Subscription';

const WENT_WELL = 'Went Well';
const TO_IMPROVE = 'To Improve';
@Component({
  selector: 'app-content-drop-drag',
  templateUrl: './content-drop-drag.component.html',
  styleUrls: ['./content-drop-drag.component.scss']
})
export class ContentDropDragComponent implements OnInit, OnDestroy {

  addNewRetroBoardCardForm: FormGroup;
  newCardContentFormControl = new FormControl('', [Validators.required, Validators.maxLength(500)]);
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
  spinnerTickSubscription: any;
  timerIsRunningForBottomNavbarBtnSunscriptions: any;

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
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    public mediaObserver: MediaObserver) {}

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

  dataIsLoading = false;

  wentWellDropDownContainerId = 'went well';
  toImproveDropDownContainerId = 'to improve';

  mediaSub: Subscription;
  devicesXs: boolean;
  devicesSm: boolean;
  devicesMd: boolean;
  devicesLg: boolean;
  devicesXl: boolean;

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
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.devicesXs = result.mqAlias === 'xs' ? true : false;
      this.devicesSm = result.mqAlias === 'sm' ? true : false;
      this.devicesMd = result.mqAlias === 'md' ? true : false;
      this.devicesLg = result.mqAlias === 'lg' ? true : false;
      this.devicesXl = result.mqAlias === 'xl' ? true : false;
    });
    this.currentUser = this.localStorageService.getDecryptedItem(this.localStorageService.currentUserKey);
    this.userWorkspace = this.localStorageService.getDecryptedItem(this.localStorageService.userWorkspaceKey);

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
    if (this.tickSubscription !== undefined) {
      this.tickSubscription.unsubscribe();
    }
    if (this.timerIsRunningForBottomNavbarBtnSunscriptions !== undefined) {
      this.timerIsRunningForBottomNavbarBtnSunscriptions.unsubscribe();
    }
    this.timerIsFinsihedSubscriptions.unsubscribe();
    this.mediaSub.unsubscribe();
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
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.finishRetroBoard();
      });
    } else {
      this.finishRetroBoard();
    }
  }

  private finishRetroBoard() {
    this.currentUserInRetroBoardApiService
      .setLastRetroBoardAsFinished(this.retroBoardToProcess.id, 'team', this.retroBoardToProcess.workspaceId)
      .then(() => {
        this.timerIsRunning = false;
        this.shouldEnableVoteBtns = false;
        this.setIsFinishedInRetroBoard(true);
        this.eventsService.emitStopRetroInProgressProcessEmiter(true);
      })
      .catch(error => {
        const err = error;
      });
  }

  private prepareRetroBoardStatus(): any {
    return {
      retroBoardFirebaseDocId: this.retroBoardToProcess.id,
      teamFirebaseDocId: this.retroBoardToProcess.team.id,
      workspaceFirebaseDocId: this.retroBoardToProcess.workspaceId,
    };
  }

  private setIsFinishedInRetroBoard(isFinished: boolean) {
    this.retroProcessIsStoped = isFinished;
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    // tslint:disable-next-line:object-literal-shorthand
    const retroBoardToUpdate = { isFinished: isFinished, lastModifiedDate: currentDate };
    this.firestoreRetroInProgressService.updateRetroBoard(retroBoardToUpdate, this.retroBoardToProcess.id);
  }

  private setLastRetroBoardAsFinished(retroBoardLastRetroBoard: RetroBoardStatus) {
    this.currentUserInRetroBoardApiService
      .setLastRetroBoardAsStarted(
        retroBoardLastRetroBoard.retroBoardFirebaseDocId,
        retroBoardLastRetroBoard.teamFirebaseDocId,
        retroBoardLastRetroBoard.workspaceFirebaseDocId)
        .then(() => {

        })
        .catch(error => {
          const err = error;
        });
  }

  openRetroProcess() {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.openRetroBoard();
      });
    } else {
      this.openRetroBoard();
    }
  }

  private openRetroBoard() {
    this.currentUserInRetroBoardApiService
      .setLastRetroBoardAsOpened(this.retroBoardToProcess.id, 'team', this.retroBoardToProcess.workspaceId)
      .then(() => {
        this.shouldEnableVoteBtns = true;
        this.setIsFinishedInRetroBoard(false);
        this.eventsService.emitStartRetroInProgressProcessEmiter(true);
      })
      .catch(error => {
        const err = error;
      });
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
              const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
              const timerSettingId = timerSettingsSnapshot.docs[0].id;
              const timerSettingToUpdate = { chosenTimerOpt: timerOpt, isStarted: true,  updateDate: currentDate};
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
      const team = teamSnapshot.data() as Team;
      // tslint:disable-next-line:max-line-length
      const currentResolutionDevices = this.getCurrentResolutionDevices();
      const dialogRef = this.dialog.open(TeamRetroInProgressShowActionDialogComponent, {
        width: '1100px',
        data: {
          currentCard,
          retroBoardId:
          this.retroBoardToProcess.id,
          workspaceId:
          this.currentWorkspace.id,
          teamId,
          retroBoardName: this.retroBoardToProcess.retroName,
          teamName: team.name,
          currentResolutionDevices}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {}
      });
    });
  }

  private getCurrentResolutionDevices() {
    // tslint:disable-next-line:max-line-length
    return { devicesXs: this.devicesXs, devicesSm: this.devicesSm, devicesMd: this.devicesMd, devicesXl: this.devicesXl, devicesLg: this.devicesLg };
  }

  openAllCardActionDialog() {
    const retroBoardCardToShow = new Array<RetroBoardCard>();
    this.prepareRetroBoardCardToShowInAllActionView(this.wnetWellRetroBoardCol.retroBoardCards, retroBoardCardToShow);
    this.prepareRetroBoardCardToShowInAllActionView(this.toImproveRetroBoardCol.retroBoardCards, retroBoardCardToShow);

    retroBoardCardToShow.concat(this.toImproveRetroBoardCol.retroBoardCards);

    this.getCurrentRetroBoardTeamPromise().then(teamSnapshot => {
      const teamId = teamSnapshot.id as string;
      const team = teamSnapshot.data() as Team;
      const dialogRef = this.dialog.open(TeamRetroInProgressShowAllActionsDialogComponent, {
        width: '1100px',
        data: {
          retroBoardCardToShow,
          retroBoardId: this.retroBoardToProcess.id,
          workspaceId: this.currentWorkspace.id,
          teamId,
          retroBoardName: this.retroBoardToProcess.retroName,
          teamName: team.name
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {}
      });
    });
  }

  openPreviousCardActionDialog() {
    this.getCurrentRetroBoardTeamPromise().then(teamSnapshot => {
      const teamId = teamSnapshot.id as string;
      const team = teamSnapshot.data() as Team;
      const dialogRef = this.dialog.open(TeamRetroInProgressShowPreviousActionsDialogComponent, {
        width: '1100px',
        data: {
          previousRetroBoardToShowActionsDocId: this.previousRetroBoardToShowActionsDocId,
          workspaceId: this.currentWorkspace.id,
          teamId,
          teamName: team.name
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
        const retroBoardCardToSave: RetroBoardCardApiToSave = {
          retroBoardFirebaseDocId: this.retroBoardToProcess.id,
          text: card.name,
          userFirebaseDocId: card.userId
        };
        this.currentUserInRetroBoardApiService.setRetroBoardCard(retroBoardCardToSave)
        .then(response => {
          const savedRetroBoardCardInApi = response as RetroBoardCardApiGet;
          const cardToSaveInFirebase = this.prepareRetroBoardCardToSave(card, savedRetroBoardCardInApi.id);
          this.firestoreRetroInProgressService.addNewRetroBoardCard(cardToSaveInFirebase).then(newRetroBoardCardSnapshot => {
            const newRetroBoardCardId = newRetroBoardCardSnapshot.id as string;
            const retroBoardCardToUpdateAfterSave: RetroBoardCardApi = {
              retroBoardCardApiId: savedRetroBoardCardInApi.id,
              retroBoardCardFirebaseDocId: newRetroBoardCardId,
              retroBoardFirebaseDocId: this.retroBoardToProcess.id,
              text: card.name,
              userFirebaseDocId: card.userId,
              isMerged: false,
              mergedContent: []
            };

            this.currentUserInRetroBoardApiService.updateRetroBoardCardFirebaseDocId(retroBoardCardToUpdateAfterSave)
              .then(() => {})
              .catch(error => {
                const err = error;
              });

          });
        })
        .catch(error => {
          const err = error;
        });
      } else if (!card.isNewItem && card.isEdit) {
        this.firestoreRetroInProgressService.findRetroBoardCardById(card.id).then(retroBoardCardSnapshot => {
          if (retroBoardCardSnapshot.exists) {
            card.isNewItem = false;
            card.isEdit = false;

            const cardToUpdate = this.prepareRetroBoardCardToUpdate(card);
            const retroBoardCardToSave: RetroBoardCardApi = {
              retroBoardFirebaseDocId: this.retroBoardToProcess.id,
              retroBoardCardFirebaseDocId: card.id,
              text: card.name,
              userFirebaseDocId: card.userId,
              retroBoardCardApiId: card.retoBoardCardApiId,
              isMerged: card.isMerged,
              mergedContent: []
            };

            this.currentUserInRetroBoardApiService.updateRetroBoardCard(retroBoardCardToSave)
            .then(() => {
              this.firestoreRetroInProgressService.updateRetroBoardCard(cardToUpdate, card.id);
            })
            .catch(error => {
              const err = error;
            });
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
      this.unmergeProcess(currentCard);
    }
  }

  onVoteCard(currentCard: RetroBoardCard) {
    currentCard.isClickedFromVoteBtn = true;
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.voteCardProcess(currentCard);
      });
    } else {
      this.voteCardProcess(currentCard);
    }
  }

  private voteCardProcess(currentCard: RetroBoardCard) {
    this.currentUserInRetroBoardApiService.getUserVoteCount(this.currentUser.uid, this.retroBoardToProcess.id).then(response => {
      const userVoteCount = response;
      if (userVoteCount >= this.retroBoardOptions.maxVouteCount) {
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
            .catch(error => { });
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
      const positionMarginNext = this.devicesXs ? 22 : 17;
      filteredUsersVotes.forEach(usrVote => {
        usrVote.positionForMargin = positionForMargin;
        positionForMargin = positionForMargin + positionMarginNext;
        usersVotesToReturn.push(usrVote);
      });
      return usersVotesToReturn;
    }
  }

  private getUsersVotes() {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getUserVotesInitPage();
      });
    } else {
      this.getUserVotesInitPage();
    }
  }

  private getUserVotesInitPage() {
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

      if (result !== undefined && result !== null) {
        if (result.addedNewActionSuccessfully) {
          this.addedAdditionalInfoWithCurrentActionCountInRetroBoard();
        }
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

    if (this.shouldResetCard()) {
      this.addNewRetroBoardCardForm.reset();
    }
  }

  removeRetroBoardCard(currentCard: RetroBoardCard) {
    currentCard.isInDeleting = true;
    if (currentCard.isWentWellRetroBoradCol) {
      this.removeLocalCardFromArray(currentCard, WENT_WELL);
    } else {
      this.removeLocalCardFromArray(currentCard, TO_IMPROVE);
    }
    this.firestoreRetroInProgressService.removeRetroBoardCard(currentCard.id).finally(() => {
      this.currentUserInRetroBoardApiService.setRemoveRetroBoardCardsToUnMerge(currentCard.retoBoardCardApiId, currentCard.id)
        .then(() => {})
        .catch(error => {
          const err = error;
        });
    });
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

        if (event.container.data.length > 0) {

          const isWentWellContainer = event.container.id === WENT_WELL;

          if (isWentWellContainer) {
            const col = this.board.columns.find(x => x.name === WENT_WELL);
            if (event.container.data.length === col.retroBoardCards.length){
              col.retroBoardCards.forEach(rbc => {
                if (!rbc.isWentWellRetroBoradCol) {
                  rbc.isWentWellRetroBoradCol = true;
                  const retroBoardCardToUpdate = this.prepareRetroBoardCardToUpdate(rbc);
                  this.firestoreRetroInProgressService.updateRetroBoardCard(retroBoardCardToUpdate, rbc.id);
                }
              });
            }
          } else {
            const col = this.board.columns.find(x => x.name === TO_IMPROVE);
            if (event.container.data.length === col.retroBoardCards.length) {
              col.retroBoardCards.forEach(rbc => {
                if (rbc.isWentWellRetroBoradCol) {
                  rbc.isWentWellRetroBoradCol = false;
                  const retroBoardCardToUpdate = this.prepareRetroBoardCardToUpdate(rbc);
                  this.firestoreRetroInProgressService.updateRetroBoardCard(retroBoardCardToUpdate, rbc.id);
                }
              });
            }
          }
        }

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

              this.currentUserInRetroBoardApiService.getRetroBoard(findedRetroBoard.id)
                .then(response => {
                  if (response !== undefined && response !== null) {
                    const retroBoardDataFromApi = response as RetroBoardApi;

                    this.retroBoardToProcess.retroName = retroBoardDataFromApi.retroBoardName;
                    this.retroBoardToProcess.sprintNumber = retroBoardDataFromApi.sprintNumber;

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
                  }
                })
                .catch(error => {
                  const err = error;
                });
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
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.setAllCurrentUserInRetroBoardProcessInitPage();
      });
    } else {
      this.setAllCurrentUserInRetroBoardProcessInitPage();
    }
  }

  private setAllCurrentUserInRetroBoardProcessInitPage() {
    this.currentUserInRetroBoardApiService.getCurrentUserInRetroBoard(this.retroBoardToProcess.id).then(response => {
      const currentUsersInRetroBoardToDisplay = response;
      this.currentUsersInRetroBoard = currentUsersInRetroBoardToDisplay;
      this.currentUsersInRetroBoardCount = response.length;
      this.prepareActualUserVoteCount();
    }).catch(error => {
      const err = error;
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
        if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
          this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
            this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
            this.setUserInTeamInApi(this.currentWorkspace.id, currentRetroBoardTeamId);
          });
        } else {
          this.setUserInTeamInApi(this.currentWorkspace.id, currentRetroBoardTeamId);
        }
      });
    });
  }

  private setUserInTeamInApi(workspaceId: string, teamId: string) {
    this.currentUserInRetroBoardApiService.setUserInTeam(
      this.currentUser.uid,
      teamId,
      workspaceId,
      this.currentUser.chosenAvatarName,
      this.currentUser.displayName)
        .then(() => {});
  }

  private setUpTimerBaseSetting(retroBoardId: string) {
    this.firestoreRetroInProgressService.getFilteredTimerSettingForCurrentRetroBoard(retroBoardId).then(timerSettingsSnapshot => {
      if (timerSettingsSnapshot.docs.length === 0) {
        const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
        const timerSetting: TimerSettingToSave = {
          chosenTimerOpt: {},
          // tslint:disable-next-line:object-literal-shorthand
          retroBoardId: retroBoardId,
          isStarted: false,
          updateDate: currentDate
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
          const freshRetroBoardCards = new Array<RetroBoardCard>();

          this.currentUserInRetroBoardApiService.getRetroBoardCards(this.retroBoardToProcess.id)
          .then(response => {
            if (response !== undefined && response !== null) {
              const retroBoardCards = response;
              retroBoardCardsSnapshot.forEach(retroBoardCardSnapshot => {
                const retroBoardCard = retroBoardCardSnapshot.payload.doc.data() as RetroBoardCard;
                const retroBoardCardDocId = retroBoardCardSnapshot.payload.doc.id as string;
                retroBoardCard.id = retroBoardCardDocId;

                const findedRetroBoardCardApi = retroBoardCards.find(rbc => rbc.retroBoardCardApiId === retroBoardCard.retoBoardCardApiId);
                this.setCorrectretroBoardCardText(findedRetroBoardCardApi, retroBoardCard);

                this.retroBoardCardsProcessing(retroBoardCard);
                this.addTofreshRetroBoard(freshRetroBoardCards, retroBoardCard);
              });

              this.setIsExistingSomeRetroBoardCardActions();
              this.removeRetroBoardCardFromArrayWhenIsNotExistingCard(freshRetroBoardCards);
            }
          });
      });
  }

  private setCorrectretroBoardCardText(findedRetroBoardCardApi: RetroBoardCardApi, retroBoardCard: RetroBoardCard) {
    if (findedRetroBoardCardApi !== undefined && findedRetroBoardCardApi !== null) {
      retroBoardCard.name = findedRetroBoardCardApi.text;
      if (findedRetroBoardCardApi.isMerged) {
        retroBoardCard.mergedContent = findedRetroBoardCardApi.mergedContent;
      }
    }
  }

  private addTofreshRetroBoard(freshRetroBoardCards: RetroBoardCard[], retroBoardCard: RetroBoardCard) {
    freshRetroBoardCards.push(retroBoardCard);
  }

  private retroBoardCardsProcessing(retroBoardCard: RetroBoardCard) {
    if (this.isCurrentlyNotAddedToRetroBoardCards(retroBoardCard)) {
      this.addRetroBoardCardToCorrectColumn(retroBoardCard);
    } else if (this.isCardToUpdateName(retroBoardCard)) {
      if (retroBoardCard.isWentWellRetroBoradCol) {
        this.updateLocalRetroBoardCardAfterChangeName(retroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards);
      } else {
        this.updateLocalRetroBoardCardAfterChangeName(retroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
      }
    } else if (this.isCardToUpdateColumn(retroBoardCard)) {
      const freshRetroBoardIsInWentWellCol = retroBoardCard.isWentWellRetroBoradCol;
      if (freshRetroBoardIsInWentWellCol) {
        // tslint:disable-next-line:max-line-length
        this.updateLocalRetroBoardCardAfterChangeColumn(retroBoardCard, this.toImproveRetroBoardCol.retroBoardCards, TO_IMPROVE);
      } else {
        this.updateLocalRetroBoardCardAfterChangeColumn(retroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards, WENT_WELL);
      }
    } else if (this.isCardToUpdateVoteCount(retroBoardCard)) {
      if (retroBoardCard.isWentWellRetroBoradCol) {
        this.updateLocalRetroBoardCardAfterChangeVouteCount(retroBoardCard, this.wnetWellRetroBoardCol.retroBoardCards);
      } else {
        this.updateLocalRetroBoardCardAfterChangeVouteCount(retroBoardCard, this.toImproveRetroBoardCol.retroBoardCards);
      }
    }
  }

  private updateLocalRetroBoardCardAfterChangeName(retroBoardCard: RetroBoardCard, retroBoardCards: RetroBoardCard[]) {
    const findedRetroBoardToUpdate = retroBoardCards.find(rbc => rbc.id === retroBoardCard.id && rbc.name !== retroBoardCard.name);

    findedRetroBoardToUpdate.name = retroBoardCard.name;

    const index = this.getArrayIndex(findedRetroBoardToUpdate, retroBoardCards);
    this.updateLocalRetroBoardCard(index, findedRetroBoardToUpdate, retroBoardCards);
  }

  private updateLocalRetroBoardCardAfterChangeVouteCount(retroBoardCard: RetroBoardCard, retroBoardCards: RetroBoardCard[]) {
    // tslint:disable-next-line:max-line-length
    const findedRetroBoardToUpdate = retroBoardCards.find(rbc => rbc.id === retroBoardCard.id && rbc.voteCount !== retroBoardCard.voteCount);

    findedRetroBoardToUpdate.voteCount = retroBoardCard.voteCount;

    const index = this.getArrayIndex(findedRetroBoardToUpdate, retroBoardCards);
    this.updateLocalRetroBoardCard(index, findedRetroBoardToUpdate, retroBoardCards);
  }

  private updateLocalRetroBoardCardAfterChangeColumn(
    retroBoardCard: RetroBoardCard, retroBoardCards: RetroBoardCard[], colNameToRemove: string) {

    const findedRetroBoardToUpdate = retroBoardCards.find(
      rbc => rbc.id === retroBoardCard.id && rbc.isWentWellRetroBoradCol !== retroBoardCard.isWentWellRetroBoradCol);

    findedRetroBoardToUpdate.isWentWellRetroBoradCol = retroBoardCard.isWentWellRetroBoradCol;

    this.removeLocalCardFromArray(findedRetroBoardToUpdate, colNameToRemove);
    this.addRetroBoardCardToCorrectColumn(findedRetroBoardToUpdate);
  }

  private isCardToUpdateName(retroBoardCard: RetroBoardCard) {
    const isCurrentlyAdded = !this.isCurrentlyNotAddedToRetroBoardCards(retroBoardCard);
    const shoudlUpdateName =
      this.wnetWellRetroBoardCol.retroBoardCards.some(rbc => rbc.id === retroBoardCard.id && rbc.name !== retroBoardCard.name) ||
      this.toImproveRetroBoardCol.retroBoardCards.some(rbc => rbc.id === retroBoardCard.id && rbc.name !== retroBoardCard.name);

    return isCurrentlyAdded && shoudlUpdateName;
  }

  private isCardToUpdateVoteCount(retroBoardCard: RetroBoardCard) {
    const isCurrentlyAdded = !this.isCurrentlyNotAddedToRetroBoardCards(retroBoardCard);
    const shoudlUpdateName =
      this.wnetWellRetroBoardCol.retroBoardCards.some(rbc => rbc.id === retroBoardCard.id && rbc.voteCount !== retroBoardCard.voteCount) ||
      this.toImproveRetroBoardCol.retroBoardCards.some(rbc => rbc.id === retroBoardCard.id && rbc.voteCount !== retroBoardCard.voteCount);

    return isCurrentlyAdded && shoudlUpdateName;
  }

  private isCardToUpdateColumn(retroBoardCard: RetroBoardCard) {
    const isCurrentlyAdded = !this.isCurrentlyNotAddedToRetroBoardCards(retroBoardCard);
    const shoudlUpdateColumn =
      // tslint:disable-next-line:max-line-length
      this.wnetWellRetroBoardCol.retroBoardCards.some(rbc => rbc.id === retroBoardCard.id && rbc.isWentWellRetroBoradCol !== retroBoardCard.isWentWellRetroBoradCol) ||
      // tslint:disable-next-line:max-line-length
      this.toImproveRetroBoardCol.retroBoardCards.some(rbc => rbc.id === retroBoardCard.id && rbc.isWentWellRetroBoradCol !== retroBoardCard.isWentWellRetroBoradCol);

    return isCurrentlyAdded && shoudlUpdateColumn;
  }

  private removeRetroBoardCardFromArrayWhenIsNotExistingCard(freshRetroBoardCards: RetroBoardCard[]) {
    this.wnetWellRetroBoardCol.retroBoardCards.forEach(rbc => {
      if (!freshRetroBoardCards.some(frbc => frbc.id === rbc.id) && rbc.isNewItem === false && rbc.isEdit === false) {
        this.removeLocalCardFromArray(rbc, WENT_WELL);
      }
    });
    this.toImproveRetroBoardCol.retroBoardCards.forEach(rbc => {
      if (!freshRetroBoardCards.some(frbc => frbc.id === rbc.id) && rbc.isNewItem === false && rbc.isEdit === false) {
        this.removeLocalCardFromArray(rbc, TO_IMPROVE);
      }
    });
  }

  private isCurrentlyNotAddedToRetroBoardCards(retroBoardCard) {
    return !this.wnetWellRetroBoardCol.retroBoardCards.some(rbc => rbc.id === retroBoardCard.id) &&
          !this.toImproveRetroBoardCol.retroBoardCards.some(rbc => rbc.id === retroBoardCard.id);
  }

  private setIsExistingSomeRetroBoardCardActions() {
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

            this.currentUserInRetroBoardApiService.getRetroBoard(findedRetroBoard.id)
            .then(response => {
              if (response !== undefined && response !== null) {
                const retroBoardDataFromApi = response as RetroBoardApi;

                this.retroBoardToProcess.retroName = retroBoardDataFromApi.retroBoardName;
                this.retroBoardToProcess.sprintNumber = retroBoardDataFromApi.sprintNumber;

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
              }
            })
            .catch(error => {
              const err = error;
            });
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
            if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
              this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
                this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
                this.setUserInTeamInApi(workspaceId, retroBoardTeamId);
              });
            } else {
              this.setUserInTeamInApi(workspaceId, retroBoardTeamId);
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

              this.localStorageService.removeItem(this.localStorageService.userWorkspaceKey);
              this.localStorageService.setEncryptedItem(this.localStorageService.userWorkspaceKey, userWorkspace);

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

  private prepareRetroBoardCardToSave(card: RetroBoardCard, retoBoardCardApiId = null, mergedGroupApiId = null) {
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    const cardToSave = {
      // name: card.name,
      isEdit: card.isEdit,
      index: card.index,
      isNewItem: card.isNewItem,
      isMerged: card.isMerged,
      isWentWellRetroBoradCol: card.isWentWellRetroBoradCol,
      // mergedContent: card.mergedContent,
      retroBoardId: card.retroBoardId,
      userId: this.currentUser.uid,
      voteCount: card.voteCount,
      actions: new Array<any>(),
      modifyDate: currentDate,
      retoBoardCardApiId,
      mergedGroupApiId
    };

    return cardToSave;
  }

  private prepareRetroBoardCardToSaveFromMerged(mergedCard: RetroBoardCardApi, isWentWellRetroBoradCol: boolean, index: number) {
    return {
      userId: mergedCard.userFirebaseDocId,
      index,
      isNewItem: false,
      isMerged: false,
      isEdit: false,
      isWentWellRetroBoradCol,
      voteCount: 0,
      actions: new Array<any>(),
      retroBoardId: this.retroBoardToProcess.id,
      retoBoardCardApiId: mergedCard.retroBoardCardApiId
    };
  }

  private prepareRetroBoardCardToUpdate(card: RetroBoardCard) {
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    return {
      isEdit: card.isEdit,
      index: card.index,
      isNewItem: card.isNewItem,
      isMerged: card.isMerged,
      isWentWellRetroBoradCol: card.isWentWellRetroBoradCol,
      voteCount: card.voteCount,
      retroBoardId: card.retroBoardId,
      modifyDate: currentDate,
      retoBoardCardApiId: card.retoBoardCardApiId
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
      mergedContent: null,
      retroBoardId: this.retroBoardToProcess.id,
      userId: this.currentUser.uid,
      id: '',
      retoBoardCardApiId: 0,
      mergedGroupApiId: 0,
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
      this.mergeCards(findedFromMergedCart, currentCard, findedCurrentRetroBoardCard);
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

  private mergeCards(
    findedFromMergedCart: RetroBoardCard,
    currentCard: RetroBoardCard,
    findedCurrentRetroBoardCard: RetroBoardCard) {
      if (this.isPosibleToMerge(findedFromMergedCart, currentCard)) {
        // this.dataIsLoading = true;
        this.saveNewMergeRetroBoardCard(findedFromMergedCart, findedCurrentRetroBoardCard);
        this.removeUserVoteOnCardForMerge(findedFromMergedCart);
        this.removeUserVoteOnCardForMerge(findedCurrentRetroBoardCard);
      }
  }

  private unmergeProcess(currentCard: RetroBoardCard) {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.unMergeProcessWithApi(currentCard);
      });
    } else {
      this.unMergeProcessWithApi(currentCard);
    }
  }

  private unMergeProcessWithApi(currentCard: RetroBoardCard) {
    this.dataIsLoading = true;
    this.currentUserInRetroBoardApiService.SetRetroBoardCardsToUnMerge(currentCard.retoBoardCardApiId)
      .then(response => {
        const responseModel = response as any;
        const unmergedRetroBoardCards = responseModel.childRetroBoardCards as RetroBoardCardApi[];

        unmergedRetroBoardCards.forEach(unmergedRetroBoardCard => {
          const newRetroBoardCard = this.prepareRetroBoardCardToSaveFromMerged(
            unmergedRetroBoardCard,
            currentCard.isWentWellRetroBoradCol,
            currentCard.index);
          this.firestoreRetroInProgressService.addNewRetroBoardCard(newRetroBoardCard).then(newRetroBoardCardSnapshot => {
            const newRetroBoardCardId = newRetroBoardCardSnapshot.id as string;
            const retroBoardCardToUpdateAfterSave: RetroBoardCardApi = {
              retroBoardCardApiId: unmergedRetroBoardCard.retroBoardCardApiId,
              retroBoardCardFirebaseDocId: newRetroBoardCardId,
              retroBoardFirebaseDocId: this.retroBoardToProcess.id,
              text: unmergedRetroBoardCard.text,
              userFirebaseDocId: unmergedRetroBoardCard.userFirebaseDocId,
              isMerged: false,
              mergedContent: []
            };

            this.currentUserInRetroBoardApiService.updateRetroBoardCardFirebaseDocId(retroBoardCardToUpdateAfterSave)
              .then(() => {
                this.firestoreRetroInProgressService.removeRetroBoardCard(currentCard.id);
                this.removeUserVoteOnCardForMerge(currentCard);
              })
              .catch(error => {
                const err = error;
              }).
              finally(() => {
                this.spinnerTickSubscription = this.spinnerTickService.runNewTimer(100).subscribe((interval) => {
                  if (interval === 1) {
                    this.dataIsLoading = false;
                    this.spinnerTickSubscription.unsubscribe();
                  }
                });
              });
          });
        });
      })
      .catch(error => {
        const err = error;
      });
  }

  private removeUserVoteOnCardForMerge(currentCard: RetroBoardCard) {
    if (currentCard.voteCount > 0) {
      if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
        this.currentUserInRetroBoardApiService.regeneraTokenPromise()
          .then(refreshedTokenResponse => {
            this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
            this.removeUserVote(currentCard);
          });
      } else {
        this.removeUserVote(currentCard);
      }
    }
  }

  private removeUserVote(currentCard: RetroBoardCard) {
    this.currentUserInRetroBoardApiService
      .removeCurrentUserVoteForMerge(currentCard.id, this.currentUser.uid, this.retroBoardToProcess.id, currentCard.voteCount)
      .then(() => {
        this.getUsersVotes();
      })
      .catch(error => {
        const err = error;
      });
  }

  private saveNewMergeRetroBoardCard(findedFromMergedCart: RetroBoardCard, findedCurrentRetroBoardCard: RetroBoardCard) {
    findedFromMergedCart.isInMerge = false;
    findedFromMergedCart.isMerged = true;

    this.firestoreRetroInProgressService.removeRetroBoardCard(findedFromMergedCart.id).finally(() => {
      this.firestoreRetroInProgressService.removeRetroBoardCard(findedCurrentRetroBoardCard.id).finally(() => {
        this.saveMergedCardToApiWithTokenCheck(findedFromMergedCart, findedCurrentRetroBoardCard);
      });
    });
  }

  private saveMergedCardToApiWithTokenCheck(findedFromMergedCart: RetroBoardCard, findedCurrentRetroBoardCard: RetroBoardCard) {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise()
        .then(refreshedTokenResponse => {
          this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
          this.saveMergedRetroBoardCardToApi(findedFromMergedCart, findedCurrentRetroBoardCard);
        });
    } else {
      this.saveMergedRetroBoardCardToApi(findedFromMergedCart, findedCurrentRetroBoardCard);
    }
  }

  private saveMergedRetroBoardCardToApi(findedFromMergedCart: RetroBoardCard, findedCurrentRetroBoardCard: RetroBoardCard) {
    this.currentUserInRetroBoardApiService.SetRetroBoardCardsToMerge(findedFromMergedCart.id, findedCurrentRetroBoardCard.id)
      .then(response => {
        const retroBoardMergedParent = response as any;

        const cardToSave = this.prepareRetroBoardCardToSave(
          findedFromMergedCart,
          retroBoardMergedParent.retroBoardCardApiId,
          retroBoardMergedParent.mergedGroupId);

        cardToSave.voteCount = 0;

        this.firestoreRetroInProgressService.addNewRetroBoardCard(cardToSave).then(retroBoardCardSnapshot => {
          const newRetroBoardCardId = retroBoardCardSnapshot.id as string;

          this.currentUserInRetroBoardApiService.setRetroBoardMergedFirebaseDocId(
            retroBoardMergedParent.retroBoardCardApiId,
            newRetroBoardCardId)
            .then(() => { })
            .catch(error => {
              const err = error;
            });
        });
      })
      .catch(error => {
        const err = error;
      })
      .finally(() => {
        // this.spinnerTickSubscription = this.spinnerTickService.runNewTimer(90).subscribe((interval) => {
        //   if (interval === 1) {
        //     this.dataIsLoading = false;
        //     this.spinnerTickSubscription.unsubscribe();
        //   }
        // });
      });
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
    this.timerIsRunningForBottomNavbarBtnSunscriptions = this.eventsService.getEmitTimmerIsRunningForBottomNavbarBtnEmiter()
      .subscribe(() => this.timerIsRunning = true);
  }

  private shouldResetCard(): boolean {
    const sameElementIsInNewModeWentWell = this.wnetWellRetroBoardCol.retroBoardCards
            .some(rbc => rbc.isNewItem === true || rbc.isEdit === true);
    const sameElementIsInNewModeToImprove = this.toImproveRetroBoardCol.retroBoardCards
            .some(rbc => rbc.isNewItem === true || rbc.isEdit === true);
    if ((sameElementIsInNewModeWentWell !== undefined && sameElementIsInNewModeWentWell !== null && sameElementIsInNewModeWentWell) ||
        (sameElementIsInNewModeToImprove !== undefined && sameElementIsInNewModeToImprove !== null && sameElementIsInNewModeToImprove)) {
      return false;
    }
    return true;
  }
}
