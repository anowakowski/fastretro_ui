import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-all-retroboard-list',
  templateUrl: './all-retroboard-list.component.html',
  styleUrls: ['./all-retroboard-list.component.css']
})
export class AllRetroboardListComponent implements OnInit {

  constructor(
    private firestoreRBServices: FirestoreRetroBoardService,
    private authService: AuthService,
    private localStorageService: LocalStorageService) { }

  retroBoards: Array<RetroBoard> = new Array<RetroBoard>();

  currentUser: User;
  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['Negative Actions'], ['Positive Actions'], ''];
  public pieChartData: SingleDataSet;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];

  ngOnInit() {
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

  onRetroDetails(retroBoard: RetroBoardToSave) {
    // this.dataPassingService.setData(retroBoard.urlParamId, retroBoard);
    // this.router.navigateByUrl('/retro-in-progress/' + retroBoard.urlParamId);
  }

  private prepreRetroBoardForCurrentWorkspace() {
    this.firestoreRBServices.retroBoardFilteredByWorkspaceIdSnapshotChanges(this.currentWorkspace.id).subscribe(retroBoardsSnapshot => {
      this.retroBoards = new Array<RetroBoard>();
      const finishedRetroBoards = new Array<RetroBoardToSave>();
      const openRetroBoards = new Array<RetroBoardToSave>();

      retroBoardsSnapshot.forEach(retroBoardSnapshot => {

        const retroBoardData = retroBoardSnapshot.payload.doc.data() as RetroBoardToSave;
        retroBoardData.id = retroBoardSnapshot.payload.doc.id as string;

        retroBoardData.team.get().then(teamSnapshot => {
          const team = teamSnapshot.data();
          retroBoardData.team = team;
          if (retroBoardData.isStarted) {

            this.addToRetroBoards(retroBoardData);
            this.retroBoards.sort((a, b) => {
              // tslint:disable-next-line:no-angle-bracket-type-assertion
              return <any> a.isFinished - <any> b.isFinished;
            });

            console.log(this.retroBoards);
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
      this.retroBoards.push(finishedRetroBoard);
      this.prepareChartForFinishedRetroBoardActions(finishedRetroBoard.actions);
    });
  }

  private prepareChartForFinishedRetroBoardActions(finiszedRetroBoardActions: RetroBoardCardActions[]) {
    const wentWellActions = finiszedRetroBoardActions.filter(act => act.isWentWell);
    const toImproveActions = finiszedRetroBoardActions.filter(act => !act.isWentWell);

    const wentWellActionsCount = this.prepareCorrectValueForChartPieData(wentWellActions.length);
    const toImproveActionsCount = this.prepareCorrectValueForChartPieData(toImproveActions.length);

    this.pieChartData = [toImproveActionsCount, wentWellActionsCount, 0];
  }

  private prepareCorrectValueForChartPieData(value: number) {
    if (!value) {
      return 0;
    }

    return value;
  }
}
