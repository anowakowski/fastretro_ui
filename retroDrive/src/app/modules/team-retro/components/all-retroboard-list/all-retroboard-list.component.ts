import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-all-retroboard-list',
  templateUrl: './all-retroboard-list.component.html',
  styleUrls: ['./all-retroboard-list.component.css']
})
export class AllRetroboardListComponent implements OnInit, OnDestroy {

  constructor(
    private firestoreRBServices: FirestoreRetroBoardService,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private dataPassingService: DataPassingService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private spinnerTickService: SpinnerTickService,) { }

  retroBoards: Array<RetroBoard> = new Array<RetroBoard>();

  currentUser: User;
  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;

  showOnlyOpenedIsFiltered = false;
  showOnlyFinishedIsFiltered = false;
  dataIsLoading = false;

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
    this.spinnerTick();
    this.dataIsLoading = true;
    this.currentUser = this.localStorageService.getItem('currentUser');

    if (this.currentUser === undefined) {
      this.authService.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getItem('userWorkspace');
        this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent);

        this.prepreRetroBoardForCurrentWorkspace();
      }
    }
  }

  ngOnDestroy() {
    //this.unsubscribeTickService();
  }


  onRetroDetails(retroBoard: RetroBoardToSave) {
     this.dataPassingService.setData(retroBoard.urlParamId, retroBoard);
     this.router.navigateByUrl('/retro-in-progress/' + retroBoard.urlParamId);
  }

  checkIfChartDataExists(chartData: any[]) {
    return chartData.some(x => x > 0);
  }

  showOnlyOpenedRetro() {
    this.dataIsLoading = true;
    if (this.showOnlyOpenedIsFiltered) {
      this.showOnlyOpenedIsFiltered = false;
      this.showOnlyFinishedIsFiltered = false;
      this.prepreRetroBoardForCurrentWorkspace();
    } else {
      this.showOnlyOpenedIsFiltered = true;
      this.showOnlyFinishedIsFiltered = false;
      this.prepreRetroBoardForCurrentWorkspace(true, false);
    }
  }

  showOnlyFinishedRetro() {
    this.dataIsLoading = true;
    if (this.showOnlyFinishedIsFiltered) {
      this.showOnlyOpenedIsFiltered = false;
      this.showOnlyFinishedIsFiltered = false;
      this.prepreRetroBoardForCurrentWorkspace();
    } else {
      this.showOnlyOpenedIsFiltered = false;
      this.showOnlyFinishedIsFiltered = true;
      this.prepreRetroBoardForCurrentWorkspace(false, true);
    }
  }

  private prepreRetroBoardForCurrentWorkspace(showOnlyOpenedRetro = false, showOnlyFinishedRetro = false) {
    this.firestoreRBServices.retroBoardFilteredByWorkspaceIdSnapshotChanges(this.currentWorkspace.id).subscribe(retroBoardsSnapshot => {
      this.retroBoards = new Array<RetroBoard>();
      retroBoardsSnapshot.forEach(retroBoardSnapshot => {
        const retroBoardData = retroBoardSnapshot.payload.doc.data() as RetroBoardToSave;
        retroBoardData.id = retroBoardSnapshot.payload.doc.id as string;

        retroBoardData.team.get().then(teamSnapshot => {
          const team = teamSnapshot.data();
          retroBoardData.team = team;
          if (retroBoardData.isStarted) {

            if (showOnlyOpenedRetro) {
              if (!retroBoardData.isFinished) {
                this.addToRetroBoards(retroBoardData);
              }
            } else if (showOnlyFinishedRetro) {
              if (retroBoardData.isFinished) {
                this.addToRetroBoards(retroBoardData);
              }
            } else {
              this.addToRetroBoards(retroBoardData);
            }

            this.retroBoards.sort((a, b) => {
              // tslint:disable-next-line:no-angle-bracket-type-assertion
              return <any> a.isFinished - <any> b.isFinished;
            });

            this.dataIsLoading = false;
          }
        });
      });
    });
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
    // this.pieChartData = [toImproveActionsCount, wentWellActionsCount, 0];
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

  private spinnerTick() {
    this.spinner.show();
    // tslint:disable-next-line:no-shadowed-variable
    this.spinnerTickSubscription = this.spinnerTickService.runNewTimer(1000).subscribe((interval) => {
      if (interval === 1) {
        this.shouldShowContent = true;
      } else if (interval === 2) {
        this.spinner.hide();
        this.unsubscribeTickService();
      }
    });
  }
}
