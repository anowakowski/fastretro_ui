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
import { AllRetroBoardListDataSerivceService } from './all-retro-board-list-data-serivce.service';

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

  private readonly shouldShowOnlyFinishedFilterName = 'shouldShowOnlyFinished';

  private readonly shouldShowOnlyOpenedFilterName = 'shouldShowOnlyOpened';

  constructor(
    private firestoreRBServices: FirestoreRetroBoardService,
    private allRetroBoardListDataService: AllRetroBoardListDataSerivceService,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private dataPassingService: DataPassingService,
    private router: Router,
    private eventsService: EventsService) {
     }

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
    return this.allRetroBoardListDataService.getRetroBoardSnapshotChangesForBatch(
      this.currentWorkspace.id, batchSize, lastSeen, this.filters)
      .pipe(
        tap(arr => (arr.length ? null : (this.theEnd = true))),
        map(arr => {
          return arr.reduce((acc, cur) => {
            const id = cur.payload.doc.id;
            const retroBoardData = cur.payload.doc.data() as RetroBoardToSave;
            retroBoardData.id = id;

            if (retroBoardData.isFinished) {
              this.prepareActionForFinishedRetroBoardCards(retroBoardData as RetroBoard);
            }

            return { ...acc, [id]: retroBoardData };
          }, {});
        })
      );
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
    if (chartData === undefined) {
      return false;
    }
    return chartData.some(x => x > 0);
  }

  showOnlyOpenedRetro() {
    this.dataIsLoading = true;
    if (this.showOnlyOpenedIsFiltered) {
      this.showOnlyOpenedIsFiltered = false;
      this.showOnlyFinishedIsFiltered = false;
      this.clearOffset();
      this.prepareBatchProcessing();
    } else {
      this.showOnlyOpenedIsFiltered = true;
      this.showOnlyFinishedIsFiltered = false;
      this.clearOffset();
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

  private clearOffset() {
    this.offset = new BehaviorSubject(null);
  }


  private prepareFilters() {
    this.filters = [];
    const filterShouldShowOnlyFinished = {
      name: this.shouldShowOnlyFinishedFilterName,
      value: this.showOnlyFinishedIsFiltered
    };
    const filterShouldShowOnlyOpened = {
      name: this.shouldShowOnlyOpenedFilterName,
      value: this.showOnlyOpenedIsFiltered
    };

    this.filters.push(filterShouldShowOnlyFinished);
    this.filters.push(filterShouldShowOnlyOpened);
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
  }

  private prepareCorrectValueForChartPieData(value: number) {
    if (!value) {
      return 0;
    }

    return value;
  }

  private unsubscribeTickService() {
    this.spinnerTickSubscription.unsubscribe();
  }
}
