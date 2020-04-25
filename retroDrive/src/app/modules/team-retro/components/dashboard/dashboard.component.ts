import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from 'src/app/services/local-storage.service';

import { User } from 'src/app/models/user';
import { MatDialog } from '@angular/material/dialog';
// tslint:disable-next-line:import-spacing
import { WelcomeInfoNewUsersDashboardDialogComponent }
  from '../welcome-info-new-users-dashboard-dialog/welcome-info-new-users-dashboard-dialog.component';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(
    private localStorageService: LocalStorageService,
    public dialog: MatDialog,
    private firestoreRBServices: FirestoreRetroBoardService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  currentUser: User;
  userWorkspace: UserWorkspace;

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
  }

  private prepareUserInLocalStorage() {
    this.currentUser = this.localStorageService.getItem('currentUser');
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
  }

  openDialog() {
    const dialogRef = this.dialog.open(WelcomeInfoNewUsersDashboardDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('dialog was close');
    });
  }
}
