import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { LocalStorageService } from 'src/app/services/local-storage.service';

import { User } from 'src/app/models/user';
import { MatDialog } from '@angular/material/dialog';
// tslint:disable-next-line:import-spacing
import { WelcomeInfoNewUsersDashboardDialogComponent }
  from '../welcome-info-new-users-dashboard-dialog/welcome-info-new-users-dashboard-dialog.component';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Workspace } from 'src/app/models/workspace';
import { RetroBoardToSave } from 'src/app/models/retroBoardToSave';
import { DataPassingService } from 'src/app/services/data-passing.service';
import { Router } from '@angular/router';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { RetroBoard } from 'src/app/models/retroBoard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  simpleRetroBoardCards: any[];

  constructor(
    private localStorageService: LocalStorageService,
    public dialog: MatDialog,
    private firestoreRBServices: FirestoreRetroBoardService,
    private dataPassingService: DataPassingService,
    private router: Router) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  currentUser: User;
  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;

  retroBoards: Array<RetroBoard>;


  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['Negative'], ['Positive'], ''];
  public pieChartData: SingleDataSet = [7, 5, 0];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];

  public firstTimeLoadElementForSpinner = true;

  ngOnInit() {
    this.prepareUserInLocalStorage();
    if (this.currentUser.isNewUser) {
      this.openDialog();
    }

    this.prepreRetroBoardForCurrentWorkspace();
  }

  openDialog() {
    const dialogRef = this.dialog.open(WelcomeInfoNewUsersDashboardDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('dialog was close');
    });
  }

  onRetroDetails(retroBoard: RetroBoardToSave) {
    this.dataPassingService.setData(retroBoard.urlParamId, retroBoard);
    this.router.navigateByUrl('/retro-in-progress/' + retroBoard.urlParamId);
  }

  private prepareUserInLocalStorage() {
    this.currentUser = this.localStorageService.getItem('currentUser');
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
    this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent);

  }

  private prepreRetroBoardForCurrentWorkspace() {
    this.firestoreRBServices.retroBoardFilteredByWorkspaceIdSnapshotChanges(this.currentWorkspace.id).subscribe(retroBoardsSnapshot => {
      this.retroBoards = new Array<RetroBoard>();
      const finishedRetroBoards = new Array<RetroBoardToSave>();
      const openRetroBoards = new Array<RetroBoardToSave>();

      let currentLenghtIndex = 1;
      retroBoardsSnapshot.forEach(retroBoardSnapshot => {

        const retroBoardData = retroBoardSnapshot.payload.doc.data() as RetroBoardToSave;
        retroBoardData.id = retroBoardSnapshot.payload.doc.id as string;

        retroBoardData.team.get().then(teamSnapshot => {
          const team = teamSnapshot.data();
          retroBoardData.team = team;

          if (retroBoardData.isStarted) {
            if (retroBoardData.isFinished) {
              finishedRetroBoards.push(retroBoardData);

            } else {
              openRetroBoards.push(retroBoardData);
            }

            if (currentLenghtIndex === retroBoardsSnapshot.length) {
              finishedRetroBoards.sort((a, b) => {
                // tslint:disable-next-line:no-angle-bracket-type-assertion
                return <any> new Date(b.creationDate) - <any> new Date(a.creationDate);
              });

              openRetroBoards.sort((a, b) => {
                // tslint:disable-next-line:no-angle-bracket-type-assertion
                return <any> new Date(b.creationDate) - <any> new Date(a.creationDate);
              });

              this.addToRetroBoards(finishedRetroBoards, openRetroBoards);

              this.retroBoards.sort((a, b) => {
                // tslint:disable-next-line:no-angle-bracket-type-assertion
                return <any> a.isFinished - <any> b.isFinished;
              });
            }
          }
          currentLenghtIndex++;
        });
      });
    });
  }


  private addToRetroBoards(finishedRetroBoards: RetroBoardToSave[], openRetroBoards: RetroBoardToSave[]) {
    const finishedRetroBoardToDisplay = finishedRetroBoards[0];
    const openRetroBoardToDisplay = openRetroBoards[0];
    if (finishedRetroBoardToDisplay) {
      this.prepareActionForFinishedRetroBoardCards(finishedRetroBoardToDisplay as RetroBoard);
    }
    if (openRetroBoardToDisplay) {
      this.retroBoards.push(openRetroBoardToDisplay as RetroBoard);
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
    });
  }
}
