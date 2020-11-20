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
import { RetroBoardApi } from 'src/app/models/retroBoardApi';

import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  simpleRetroBoardCards: any[];
  finishedRetroBoards: RetroBoardToSave[] = new Array<RetroBoardToSave>();
  openRetroBoards: RetroBoardToSave[] = new Array<RetroBoardToSave>();
  nonStartedRetroBoards: RetroBoardToSave[] = new Array<RetroBoardToSave>();

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
    private excelService: ExcelService,
    public mediaObserver: MediaObserver) {
      monkeyPatchChartJsTooltip();
      monkeyPatchChartJsLegend();
  }

  currentUser: User;
  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;

  retroBoards: Array<RetroBoard> = new Array<RetroBoard>();
  wentWellActionCount: number;
  toImproveActionCount: number;

  mediaSub: Subscription;
  devicesXs: boolean;
  devicesSm: boolean;
  devicesMd: boolean;
  devicesLg: boolean;

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
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      console.log(result.mqAlias);
      this.devicesXs = result.mqAlias === 'xs' ? true : false;
      this.devicesSm = result.mqAlias === 'sm' ? true : false;
      this.devicesMd = result.mqAlias === 'md' ? true : false;
      this.devicesLg = result.mqAlias === 'lg' ? true : false;
    });

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

    this.mediaSub.unsubscribe();
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

  prepareCountForRertroBoardsByIsFinished(isFinishedRetroBoard: boolean) {
    if (this.retroBoards !== undefined || this.retroBoards.length > 0) {
      const filteredRetroBoards = this.retroBoards.filter(x => x.isFinished === isFinishedRetroBoard);
      return filteredRetroBoards.length;
    }
  }

  shouldHideInMiddleResolution() {
    return this.devicesMd ||  this.devicesSm || this.devicesXs;
  }

  private prepreRetroBoardForCurrentWorkspace() {
    this.retroBoardsDashboardSubscritpiton =
      this.firestoreRBServices.retroBoardFilteredByWorkspaceIdSnapshotChanges(this.currentWorkspace.id).subscribe(retroBoardsSnapshot => {

        this.getUserTeams()
          .then(userTeamsSnapshot => {
            if (!userTeamsSnapshot.empty) {
              const userTeams = userTeamsSnapshot.docs[0].data() as UserTeamsToSave;
              this.prepareRetroBoardForDashboard(retroBoardsSnapshot, userTeams);
              this.prepareCountForDashboardSummary(retroBoardsSnapshot, userTeams);
            } else {
              this.dataIsLoading = false;
              this.checkIfUserHasExistingRetroBoardsAndShowInfo();
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

  private prepareCountForDashboardSummary(retroBoardsSnapshot, userTeams) {
    retroBoardsSnapshot.forEach(retroBoardSnapshot => {
      const retroBoardData = retroBoardSnapshot.payload.doc.data() as RetroBoardToSave;
      retroBoardData.id = retroBoardSnapshot.payload.doc.id as string;
      retroBoardData.team.get().then(teamSnapshot => {
        const retroBoardTeam = teamSnapshot.data();
        retroBoardTeam.id = teamSnapshot.id;
        if (userTeams.teams.some(ut => ut.id === retroBoardTeam.id)) {
          if (retroBoardData.isStarted && retroBoardData.isFinished) {
            this.finishedRetroBoards.push(retroBoardData);
          } else if (retroBoardData.isStarted && !retroBoardData.isFinished) {
            this.openRetroBoards.push(retroBoardData);
          } else if (!retroBoardData.isStarted) {
            this.nonStartedRetroBoards.push(retroBoardData);
          }
        }
      });
    });
  }

  private getUserTeams() {
    return this.firestoreRBServices.findUserTeams(this.currentUser.uid);
   }

  private prepareRetroBoardForDashboard(retroBoardsSnapshot, userTeams) {
    if (this.currentUserInRetroBoardApiService.isTokenExpired()) {
      this.currentUserInRetroBoardApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
        this.currentUserInRetroBoardApiService.setRegeneratedToken(refreshedTokenResponse);
        this.getUserLastRetroBoardForDashboard(retroBoardsSnapshot, userTeams);
      });
    } else {
      this.getUserLastRetroBoardForDashboard(retroBoardsSnapshot, userTeams);
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
    } else {
      if (this.retroBoards.length === 0 || this.retroBoards.some(rb => rb.id !== retroboardToAdd.id)) {
        this.prepareRetroBoardWithaDataFromApi(retroboardToAdd);

      } else {
        this.dataIsLoading = false;
        this.checkIfUserHasExistingRetroBoardsAndShowInfo();
      }
    }
    this.dataIsLoading = false;
  }

  private prepareRetroBoardWithaDataFromApi(retroboardToAdd: RetroBoardToSave) {
    this.currentUserInRetroBoardApiService.getRetroBoard(retroboardToAdd.id)
      .then(response => {
        this.addToRetroBoardWithRbName(response, retroboardToAdd);
        this.checkIfUserHasExistingRetroBoardsAndShowInfo();
      })
      .catch(error => {
        const err = error;
      });
  }

  private addToRetroBoardWithRbName(rbResponse: any, retroboardToAdd: RetroBoardToSave) {
    const retroBoardDataFromApi = rbResponse as RetroBoardApi;
    const rb = retroboardToAdd as RetroBoard;

    rb.retroName = retroBoardDataFromApi.retroBoardName;
    rb.sprintNumber = retroBoardDataFromApi.sprintNumber;

    this.retroBoards.push(rb);
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
        this.prepareRetroBoardWithaDataFromApi(finishedRetroBoard);
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
