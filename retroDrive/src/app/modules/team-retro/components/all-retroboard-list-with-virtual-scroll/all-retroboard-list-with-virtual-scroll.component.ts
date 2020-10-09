import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { RetroBoard } from 'src/app/models/retroBoard';
import { RetroBoardToSave } from 'src/app/models/retroBoardToSave';
import { User } from 'src/app/models/user';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Workspace } from 'src/app/models/workspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';
import { SingleDataSet, Label } from 'ng2-charts';
import { DataPassingService } from 'src/app/services/data-passing.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerTickService } from 'src/app/services/spinner-tick.service';
import { Teams } from 'src/app/models/teams';
import { EventsService } from 'src/app/services/events.service';
import { Team } from 'src/app/models/team';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap, scan, tap, throttleTime } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

const batchSize = 20;

@Component({
  selector: 'app-all-retroboard-list-with-virtual-scroll',
  templateUrl: './all-retroboard-list-with-virtual-scroll.component.html',
  styleUrls: ['./all-retroboard-list-with-virtual-scroll.component.scss']
})
export class AllRetroBoardListWithVirtualScrollComponent implements OnInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  chosenTeamsFiltered: Teams[];
  formatedDateFrom: string;
  formatedDateTo: string;
  shouldFilterByCreateDate: boolean;

  theEnd = false;

  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;
  filters: any[];

  constructor(
    private firestoreRBServices: FirestoreRetroBoardService,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private dataPassingService: DataPassingService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private spinnerTickService: SpinnerTickService,
    private eventsService: EventsService,
    private db: AngularFirestore) {
     }

  //retroBoards: Array<RetroBoard> = new Array<RetroBoard>();
  people: any[];
  retroBoards: any[];

  currentUser: User;
  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;

  teams: Teams[];
  sortByData = new Array<string>();

  createDateFromFormControl = new FormControl();
  createDateToFormControl = new FormControl();

  showOnlyOpenedIsFiltered = false;
  showOnlyFinishedIsFiltered = false;
  dataIsLoading = false;

  retroBoardSubscriptions: any;

  shouldShowContent = false;
  private spinnerTickSubscription: any;

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['Negative Actions'], ['Positive Actions'], ''];
  public pieChartData: SingleDataSet;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];

  ngOnInit() {
    this.dataIsLoading = true;

    this.currentUser = this.localStorageService.getDecryptedItem(this.localStorageService.currentUserKey);

    if (this.currentUser === undefined) {
      this.authService.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getDecryptedItem(this.localStorageService.userWorkspaceKey);
        this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;

        this.prepareBatchProcessing();
      }
    }
  }

  ngOnDestroy() {
    if (this.retroBoardSubscriptions !== undefined) {
      this.retroBoardSubscriptions.unsubscribe();
    }
  }

  getBatch(lastSeen: string) {
    this.prepareFilters();
    return this.firestoreRBServices.retroBoardFilteredByWorkspaceIdSnapshotChangesForBatch(
      this.currentWorkspace.id, batchSize, lastSeen, this.filters)
      .pipe(
        tap(arr => (arr.length ? null : (this.theEnd = true))),
        map(arr => {
          return arr.reduce((acc, cur) => {
            const id = cur.payload.doc.id;
            const retroBoardData = cur.payload.doc.data() as RetroBoardToSave;

            return { ...acc, [id]: retroBoardData };
          }, {});
        })
      );
  }
  prepareFilters() {
    this.filters = [];
    const filterShouldShowOnlyFinished = {
      name: 'shouldShowOnlyFinished',
      value: this.showOnlyFinishedIsFiltered
    };
    const filterShouldShowOnlyOpened = {
      name: 'showOnlyOpenedIsFiltered',
      value: this.showOnlyOpenedIsFiltered
    };

    this.filters.push(filterShouldShowOnlyFinished);
    this.filters.push(filterShouldShowOnlyOpened);
  }

  nextBatch(e, offset) {
    if (this.theEnd) {
      return;
    }

    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();

    if (end === total) {
      this.offset.next(offset);
    }
  }

  trackByIdx(i) {
    return i;
  }

  onRetroDetails(retroBoard: RetroBoardToSave) {
     this.dataPassingService.setData(retroBoard.urlParamId, retroBoard);
     this.router.navigateByUrl('/retro-in-progress/' + retroBoard.urlParamId);
  }

  checkIfChartDataExists(chartData: any[]) {
    return chartData.some(x => x > 0);
  }

  private prepareBatchProcessing() {
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap(n => this.getBatch(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );

    this.infinite = batchMap.pipe(map(v => Object.values(v)));
  }

  showOnlyOpenedRetro() {
    this.dataIsLoading = true;
    if (this.showOnlyOpenedIsFiltered) {
      this.showOnlyOpenedIsFiltered = false;
      this.showOnlyFinishedIsFiltered = false;
      this.offset = new BehaviorSubject(null);
      this.prepareBatchProcessing();
    } else {
      this.showOnlyOpenedIsFiltered = true;
      this.showOnlyFinishedIsFiltered = false;
      this.offset = new BehaviorSubject(null);
      this.prepareBatchProcessing();
    }
  }

  showOnlyFinishedRetro() {
    this.dataIsLoading = true;
    this.eventsService.emitSetAllRetroBoardBackgroudnMoreHigherEmiter();
    if (this.showOnlyFinishedIsFiltered) {
      this.showOnlyOpenedIsFiltered = false;
      this.showOnlyFinishedIsFiltered = false;
      this.offset = new BehaviorSubject(null);
      this.prepareBatchProcessing();
    } else {
      this.showOnlyOpenedIsFiltered = false;
      this.showOnlyFinishedIsFiltered = true;
      this.offset = new BehaviorSubject(null);
      this.prepareBatchProcessing();
    }
  }

  onChangeTeams(eventValue) {
    if (eventValue !== null) {
      this.chosenTeamsFiltered = eventValue as Teams[];
      this.prepreRetroBoardForCurrentWorkspace(this.showOnlyOpenedIsFiltered, this.showOnlyFinishedIsFiltered, this.chosenTeamsFiltered);
    }
  }

  onChangeSort(eventValue) {
    if (eventValue !== undefined && eventValue !== null) {
      const sortByValue = eventValue as string;

      if (sortByValue !== null) {
        if (sortByValue === 'name') {
          this.sortByAsc();
        } else if (sortByValue === 'creation date') {
          this.sortByCreationDateAsc();
        }
      }
    } else {
      this.sortByIsFinishedValue();
    }
  }

  sortByDesc() {
    this.retroBoards.sort((leftSide, rightSide): number => {
      if (leftSide.retroName > rightSide.retroName) { return -1; }
      if (leftSide.retroName < rightSide.retroName) { return 1; }

      return 0;
    });
  }

  sortByAsc() {
    this.retroBoards.sort((leftSide, rightSide): number => {
      if (leftSide.retroName < rightSide.retroName) { return -1; }
      if (leftSide.retroName > rightSide.retroName) { return 1; }

      return 0;
    });
  }

  sortByCreationDateAsc() {
    this.retroBoards.sort((leftSide, rightSide): number => {
      if (leftSide.creationDate < rightSide.creationDate) { return -1; }
      if (leftSide.creationDate > rightSide.creationDate) { return 1; }

      return 0;
    });
  }

  sortByIsFinishedValue() {
    this.retroBoards.sort((a, b) => {
      // tslint:disable-next-line:no-angle-bracket-type-assertion
      return <any> a.isFinished - <any> b.isFinished;
    });
  }

  shouldDisabledWhenCreateDateFilterValueNotExisit() {
    if (this.createDateFromFormControl.value !== null && this.createDateToFormControl.value !== null) {
      return false;
    }
    return true;
  }

  filterByCreateDate() {
    if (!this.shouldDisabledWhenCreateDateFilterValueNotExisit()) {
      this.dataIsLoading = true;
      this.eventsService.emitSetAllRetroBoardBackgroudnMoreHigherEmiter();
      const dateFromValue = this.createDateFromFormControl.value;
      const dateToValue = this.createDateToFormControl.value;

      this.formatedDateFrom = this.formatCreationDate(dateFromValue);
      this.formatedDateTo = this.formatCreationDate(dateToValue);

      this.shouldFilterByCreateDate = true;

      // tslint:disable-next-line:max-line-length
      this.prepreRetroBoardForCurrentWorkspace(this.showOnlyOpenedIsFiltered, this.showOnlyFinishedIsFiltered, this.chosenTeamsFiltered);
    }
  }

  clearFilteredByCreateDate() {
    this.dataIsLoading = true;
    this.eventsService.emitSetAllRetroBoardBackgroudnMoreHigherEmiter();
    this.createDateFromFormControl.reset();
    this.createDateToFormControl.reset();
    this.shouldFilterByCreateDate = false;
    this.prepreRetroBoardForCurrentWorkspace(this.showOnlyOpenedIsFiltered, this.showOnlyFinishedIsFiltered, this.chosenTeamsFiltered);
  }

  private formatCreationDate(dateFromValue: any) {
    return formatDate(dateFromValue, 'yyyy/MM/dd', 'en');
  }

  private prepreRetroBoardForCurrentWorkspace(
    showOnlyOpenedRetro = false,
    showOnlyFinishedRetro = false,
    chosenTeams: Teams[] = null) {
    this.retroBoardSubscriptions =
      this.firestoreRBServices.retroBoardFilteredByWorkspaceIdSnapshotChanges(this.currentWorkspace.id).subscribe(retroBoardsSnapshot => {
      this.eventsService.emitSetAllRetroBoardBackgroudnMoreHigherEmiter();
      this.retroBoards = new Array<RetroBoard>();

      let currentLenghtIndex = 1;

      retroBoardsSnapshot.forEach(retroBoardSnapshot => {
        const retroBoardData = retroBoardSnapshot.payload.doc.data() as RetroBoardToSave;
        retroBoardData.id = retroBoardSnapshot.payload.doc.id as string;

        retroBoardData.team.get().then(teamSnapshot => {
          const team = teamSnapshot.data();
          const teamId = teamSnapshot.id;
          retroBoardData.team = team;
          retroBoardData.team.id = teamId;
          if (retroBoardData.isStarted) {

            if (showOnlyOpenedRetro) {
              if (!retroBoardData.isFinished) {
                this.filterRertroBoardDataWithRules(chosenTeams, retroBoardData);
              }
            } else if (showOnlyFinishedRetro) {
              if (retroBoardData.isFinished) {
                this.filterRertroBoardDataWithRules(chosenTeams, retroBoardData);
              }
            } else {
              this.filterRertroBoardDataWithRules(chosenTeams, retroBoardData);
            }

            this.sortByIsFinishedValue();

            if (currentLenghtIndex === retroBoardsSnapshot.length) {
              const isFinishedIsExisting = retroBoardsSnapshot.some(rbSnap => (rbSnap.payload.doc.data() as RetroBoardToSave).isFinished);
              if (showOnlyOpenedRetro || !isFinishedIsExisting) {
                this.dataIsLoading = false;
                this.emitSetMoreHigherForBackground();
              }
              if (this.shouldFilterByCreateDate && !isFinishedIsExisting || (this.shouldFilterByCreateDate && showOnlyOpenedRetro)) {
                this.filteredByCreatedDate();
                this.emitSetMoreHigherForBackground();
              }
            }
          }
          currentLenghtIndex++;
        });
      });

    });
  }

  private filterRertroBoardDataWithRules(
    chosenTeams: Teams[],
    retroBoardData: RetroBoardToSave) {
    if (this.shouldUseChosenTeamsParam(chosenTeams)) {
      if (this.teamIsInChosenTeamsParam(chosenTeams, retroBoardData)) {
        this.addToRetroBoards(retroBoardData);
      }
    } else {
      this.addToRetroBoards(retroBoardData);
    }
  }

  private teamIsInChosenTeamsParam(chosenTeams: Teams[], retroBoardData: RetroBoardToSave): boolean {
    if (chosenTeams.some(t => t.id === retroBoardData.team.id)) {
      return true;
    }
    return false;
  }

  private shouldUseChosenTeamsParam(chosenTeams: Teams[]): boolean {
    let result = false;
    if (chosenTeams !== undefined && chosenTeams !== null) {
      if (chosenTeams.length > 0) {
        result = true;
      }
    }
    return result;
  }

  private emitSetMoreHigherForBackground() {
    if (this.retroBoards.length > 0 && this.retroBoards.length < 3) {
      this.eventsService.emitSetAllRetroBoardBackgroudnMoreHigherEmiter();
    } else if (this.retroBoards.length >= 3) {
      this.eventsService.emitSetAllRetroBoardBackgroudnNoMoreHigherEmiter();
    }
  }

  private addToRetroBoards(retroBoard: RetroBoardToSave) {
    if (retroBoard.isFinished) {
      this.prepareActionForFinishedRetroBoardCards(retroBoard as RetroBoard);
    } else {
      this.retroBoards.push(retroBoard as RetroBoard);

    }
  }

  private prepareActionForFinishedRetroBoardCards(finishedRetroBoard: RetroBoard) {
    finishedRetroBoard.actions = new Array<RetroBoardCardActions>();

    this.firestoreRBServices.retroBoardCardActionsFilteredByRetroBoardId(finishedRetroBoard.id).then(retroBoardCardActionsSnapshot => {
      if (retroBoardCardActionsSnapshot.docs.length > 0) {

        retroBoardCardActionsSnapshot.docs.forEach(retroBoardCardSnapshot => {
          const dataRetroBoardCardAction = retroBoardCardSnapshot.data() as RetroBoardCardActions;
          dataRetroBoardCardAction.text = retroBoardCardSnapshot.id as string;
          finishedRetroBoard.actions.push(dataRetroBoardCardAction);
        });

      }
      // this.retroBoards.push(finishedRetroBoard);
      this.prepareChartForFinishedRetroBoardActions(finishedRetroBoard);
    });
  }

  private prepareChartForFinishedRetroBoardActions(finishedRetroBoard) {

    let finishedRetroBoardActions: RetroBoardCardActions[];
    finishedRetroBoardActions = finishedRetroBoard.actions;

    const wentWellActions = finishedRetroBoardActions.filter(act => act.isWentWell);
    const toImproveActions = finishedRetroBoardActions.filter(act => !act.isWentWell);

    const wentWellActionsCount = this.prepareCorrectValueForChartPieData(wentWellActions.length);
    const toImproveActionsCount = this.prepareCorrectValueForChartPieData(toImproveActions.length);

    const pieChartDataToAdd: SingleDataSet = [toImproveActionsCount, wentWellActionsCount, 0];
    finishedRetroBoard.chartData = pieChartDataToAdd;
    this.retroBoards.push(finishedRetroBoard);
    if (this.shouldFilterByCreateDate) {
      // tslint:disable-next-line:max-line-length
      this.filteredByCreatedDate();
    }
    this.dataIsLoading = false;
    this.emitSetMoreHigherForBackground();
    // this.pieChartData = [toImproveActionsCount, wentWellActionsCount, 0];
  }

  private filteredByCreatedDate() {
    const filteredRetroBoards = this.retroBoards.filter(rb => this.formatCreationDate(rb.creationDate) >= this.formatedDateFrom
      && this.formatCreationDate(rb.creationDate) <= this.formatedDateTo);
    this.retroBoards = filteredRetroBoards;
  }

  private prepareCorrectValueForChartPieData(value: number) {
    if (!value) {
      return 0;
    }

    return value;
  }

  private prepareTeams() {
    this.teams = new Array<Teams>();
    this.firestoreRBServices.getTeamsFiltered(this.currentWorkspace.id).then(snapshotTeams => {
      snapshotTeams.docs.forEach(doc => {
        const team: Teams = {
          id: doc.id,
          name: doc.data().name
        };
        this.teams.push(team);
      });
    });
  }

  private unsubscribeTickService() {
    this.spinnerTickSubscription.unsubscribe();
  }
}
