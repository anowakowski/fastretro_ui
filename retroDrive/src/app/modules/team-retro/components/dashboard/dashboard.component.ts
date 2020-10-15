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
import { AuthService } from 'src/app/services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { UserTeams } from 'src/app/models/userTeams';
import { find } from 'rxjs/operators';
import { throwMatDuplicatedDrawerError } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  simpleRetroBoardCards: any[];
  finishedRetroBoards: RetroBoardToSave[] = new Array<RetroBoardToSave>();
  openRetroBoards: RetroBoardToSave[] = new Array<RetroBoardToSave>();

  dataIsLoading = true;
  retroBoardsDashboardSubscritpiton: any;
  shouldShowInfoAboutNotExistingTeamsAndRetroBoards = false;

  constructor(
    private localStorageService: LocalStorageService,
    public dialog: MatDialog,
    private firestoreRBServices: FirestoreRetroBoardService,
    private dataPassingService: DataPassingService,
    private router: Router,
    private authService: AuthService,
    private eventServices: EventsService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    private excelService: ExcelService) {
      monkeyPatchChartJsTooltip();
      monkeyPatchChartJsLegend();
  }


  currentUser: User;
  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;

  retroBoards: Array<RetroBoard> = new Array<RetroBoard>();
  wentWellActionCount: number;
  toImproveActionCount: number;

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['Negative Actions'], ['Positive Actions'], ''];
  public pieChartData: SingleDataSet;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];

  public firstTimeLoadElementForSpinner = true;

  ngOnInit() {

    this.currentUser = this.localStorageService.getDecryptedItem(this.localStorageService.currentUserKey);

    if (this.currentUser === undefined) {
      this.authService.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getDecryptedItem(this.localStorageService.userWorkspaceKey);
        this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;

        this.prepreRetroBoardForCurrentWorkspace();
      } else {
        this.openInfoForNewUsersDialog();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.retroBoardsDashboardSubscritpiton !== undefined) {
      this.retroBoardsDashboardSubscritpiton.unsubscribe();
    }
  }

  openInfoForNewUsersDialog() {
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

  checkIfChartDataExists(chartData: any[]) {
    if (chartData !== undefined) {
      return chartData.some(x => x > 0);
    }
    return false;
  }
  private prepreRetroBoardForCurrentWorkspace() {
    this.retroBoardsDashboardSubscritpiton =
      this.firestoreRBServices.retroBoardFilteredByWorkspaceIdSnapshotChanges(this.currentWorkspace.id).subscribe(retroBoardsSnapshot => {
        this.retroBoards = new Array<RetroBoard>();
        this.finishedRetroBoards = new Array<RetroBoardToSave>();
        this.openRetroBoards = new Array<RetroBoardToSave>();

        this.prepareRetroBoardForDashboard(retroBoardsSnapshot);
        retroBoardsSnapshot.forEach(retroBoardSnapshot => {
          const retroBoardData = retroBoardSnapshot.payload.doc.data() as RetroBoardToSave;
          retroBoardData.id = retroBoardSnapshot.payload.doc.id as string;
          if (retroBoardData.isStarted) {
            if (retroBoardData.isFinished) {
              this.finishedRetroBoards.push(retroBoardData);
            } else {
              this.openRetroBoards.push(retroBoardData);
            }
          }
        });
      });
  }

  goToTeams() {
    this.eventServices.emitSetTeamsAsDefaultSection();
    this.router.navigate(['/retro/teams']);
  }

  goToRetroProcess() {
    this.eventServices.emitSetRetroProcessAsDefaultSectionEmiter();
    this.router.navigate(['/retro/process']);
  }

  goToAllRetroBoardsList() {
    this.eventServices.emitSetAllRetroBoardAsDefaultSectionEmiter();
    this.router.navigate(['/retro/all-retroboard-list']);
  }

  saveAsExcel(retroBoard: RetroBoard) {}

  private prepareRetroBoardForDashboard(retroBoardsSnapshot) {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);

        this.firestoreRBServices.findUserTeams(this.currentUser.uid)
          .then(userTeamsSnapshot => {
            if (!userTeamsSnapshot.empty) {
              const userTeams = userTeamsSnapshot.docs[0].data() as UserTeamsToSave;
              this.getUserLastRetroBoardForDashboard(retroBoardsSnapshot, userTeams);
            } else {
              this.dataIsLoading = false;
              this.checkIfUserHasExistingRetroBoardsAndShowInfo();
            }
          });
      });
    } else {
      this.firestoreRBServices.findUserTeams(this.currentUser.uid)
      .then(userTeamsSnapshot => {
        if (!userTeamsSnapshot.empty) {
          const userTeams = userTeamsSnapshot.docs[0].data() as UserTeamsToSave;
          this.getUserLastRetroBoardForDashboard(retroBoardsSnapshot, userTeams);
        } else {
          this.dataIsLoading = false;
          this.checkIfUserHasExistingRetroBoardsAndShowInfo();
        }
      });
    }
  }

  private getUserLastRetroBoardForDashboard(retroBoardsSnapshot, userTeams: UserTeamsToSave) {
    this.currentUserInRetroBoardApiService.getUserLastRetroBoardForDashboard(this.currentWorkspace.id).then(response => {
      if (response != null) {
        if (response.lastRetroBoardOpened != null && response.lastRetroBoardOpened !== '') {
          const findedLastOpenedRBSnapshot = retroBoardsSnapshot.find(rbs => {
            let predicatResult = false;
            if (rbs !== undefined) {
              if (rbs.payload !== undefined) {
                if (rbs.payload.doc.id === response.lastRetroBoardOpened) {
                  predicatResult = true;
                  return predicatResult;
                }
              }
            }
            return predicatResult;
          });
          const findedLastOpenedRB = findedLastOpenedRBSnapshot.payload.doc.data() as RetroBoardToSave;
          findedLastOpenedRB.id = findedLastOpenedRBSnapshot.payload.doc.id as string;

          findedLastOpenedRB.team.get().then(teamSnapshot => {
              const team = teamSnapshot.data();
              findedLastOpenedRB.team = team;
              findedLastOpenedRB.team.id = teamSnapshot.id;
              if (userTeams.teams.some(ut => ut.id === findedLastOpenedRB.team.id)) {
                this.addToRetroBoards(findedLastOpenedRB, false);
              } else {
                this.dataIsLoading = false;
                this.checkIfUserHasExistingRetroBoardsAndShowInfo();
              }
            });
        }
        if (response.lastRetroBoardFinished != null && response.lastRetroBoardFinished !== '') {
          const findedLastFinishedRBSnapshot = retroBoardsSnapshot.find(rbs => {
            let predicatResult = false;
            if (rbs !== undefined) {
              if (rbs.payload !== undefined) {
                if (rbs.payload.doc.id === response.lastRetroBoardFinished) {
                  predicatResult = true;
                  return predicatResult;
                }
              }
            }
            return predicatResult;
          });
          if (findedLastFinishedRBSnapshot !== undefined) {
            if (findedLastFinishedRBSnapshot.payload !== undefined) {
              const findedLastFinishedRetroBorad = findedLastFinishedRBSnapshot.payload.doc.data() as RetroBoardToSave;
              findedLastFinishedRetroBorad.id = findedLastFinishedRBSnapshot.payload.doc.id as string;

              findedLastFinishedRetroBorad.team.get().then(teamSnapshot => {
                  const team = teamSnapshot.data();
                  findedLastFinishedRetroBorad.team = team;
                  findedLastFinishedRetroBorad.team.id = teamSnapshot.id;
                  if (userTeams.teams.some(ut => ut.id === findedLastFinishedRetroBorad.team.id)) {
                    this.addToRetroBoards(findedLastFinishedRetroBorad, true);
                    this.checkIfUserHasExistingRetroBoardsAndShowInfo();
                  } else {
                    this.dataIsLoading = false;
                    this.checkIfUserHasExistingRetroBoardsAndShowInfo();
                  }
                });
            }
          }
        }
        if ((response.lastRetroBoardOpened === null || response.lastRetroBoardOpened === '') &&
            (response.lastRetroBoardFinished === null || response.lastRetroBoardFinished === '')) {
          this.dataIsLoading = false;
          this.checkIfUserHasExistingRetroBoardsAndShowInfo();
        }
      }
    });
  }

  private addToRetroBoards(retroboardToAdd: RetroBoardToSave, isFinished: boolean) {
    if (isFinished) {
      this.prepareActionForFinishedRetroBoardCards(retroboardToAdd as RetroBoard);
    }
    if (!isFinished) {
      if (this.retroBoards.length === 0 || this.retroBoards.some(rb => rb.id !== retroboardToAdd.id)) {
        this.retroBoards.push(retroboardToAdd as RetroBoard);
        this.checkIfUserHasExistingRetroBoardsAndShowInfo();
      } else {
        this.dataIsLoading = false;
        this.checkIfUserHasExistingRetroBoardsAndShowInfo();
      }
    }
    this.dataIsLoading = false;
    this.checkIfUserHasExistingRetroBoardsAndShowInfo();
  }

  private prepareActionForFinishedRetroBoardCards(finishedRetroBoard: RetroBoard) {
    finishedRetroBoard.actions = new Array<RetroBoardCardActions>();

    this.firestoreRBServices.retroBoardCardActionsFilteredByRetroBoardId(finishedRetroBoard.id).then(retroBoardCardActionsSnapshot => {
      if (retroBoardCardActionsSnapshot.docs.length > 0) {

        retroBoardCardActionsSnapshot.docs.forEach(retroBoardCardSnapshot => {
          const dataRetroBoardCardAction = retroBoardCardSnapshot.data() as RetroBoardCardActions;
          dataRetroBoardCardAction.text = retroBoardCardSnapshot.id as string;
          finishedRetroBoard.actions.push(dataRetroBoardCardAction);
          this.checkIfUserHasExistingRetroBoardsAndShowInfo();
        });
      }
      if (this.retroBoards.length === 0 || this.retroBoards.some(rb => rb.id !== finishedRetroBoard.id)) {
        this.retroBoards.push(finishedRetroBoard);
        this.prepareChartForFinishedRetroBoardActions(finishedRetroBoard.actions);
        this.checkIfUserHasExistingRetroBoardsAndShowInfo();
      } else {
        this.dataIsLoading = false;
        this.checkIfUserHasExistingRetroBoardsAndShowInfo();
      }
    });
  }

  private checkIfUserHasExistingRetroBoardsAndShowInfo() {
    this.shouldShowInfoAboutNotExistingTeamsAndRetroBoards = this.retroBoards.length === 0;
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
