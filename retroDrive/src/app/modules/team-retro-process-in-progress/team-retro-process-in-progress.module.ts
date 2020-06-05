import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamRetroProcessInProgressComponent } from './team-retro-process-in-progress.component';
import { NavComponent } from './components/nav/nav.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'src/app/shared/material-module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TeamRetroProcessInProgressRoutingModule } from './team-retro-process-in-progress-routing.module';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { RetroProgressTimerComponent } from './components/retro-progress-timer/retro-progress-timer.component';
import { ContentDropDragComponent } from './components/content-drop-drag/content-drop-drag.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// tslint:disable-next-line:import-spacing
import { TeamRetroInProgressSnackbarComponent }
  from './components/team-retro-in-progress-snackbar/team-retro-in-progress-snackbar.component';
// tslint:disable-next-line:import-spacing
import { TeamRetroInProgressSetTimeDialogComponent }
  from './components/team-retro-in-progress-set-time-dialog/team-retro-in-progress-set-time-dialog.component';

import { NgxSpinnerModule } from 'ngx-spinner';
import { FiresrtoreRetroProcessInProgressService } from './services/firesrtore-retro-process-in-progress.service';
import { AddNewActionBottomsheetComponent } from './components/add-new-action-bottomsheet/add-new-action-bottomsheet.component';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressShowActionDialogComponent } from './components/team-retro-in-progress-show-action-dialog/team-retro-in-progress-show-action-dialog.component';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressShowAllActionsDialogComponent } from './components/team-retro-in-progress-show-all-actions-dialog/team-retro-in-progress-show-all-actions-dialog.component';
// tslint:disable-next-line:max-line-length
import { JoinToExistingTeamDialogComponent } from '../team-retro/components/join-to-existing-team-dialog/join-to-existing-team-dialog.component';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressUserWithoutRbWorkspaceDialogComponent } from './components/team-retro-in-progress-user-without-rb-workspace-dialog/team-retro-in-progress-user-without-rb-workspace-dialog.component';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressUserWithoutRbTeamDialogComponent } from './components/team-retro-in-progress-user-without-rb-team-dialog/team-retro-in-progress-user-without-rb-team-dialog.component';
// tslint:disable-next-line:max-line-length
import { TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent } from './components/team-retro-in-progress-show-all-users-in-current-retro-dialog/team-retro-in-progress-show-all-users-in-current-retro-dialog-component';
import { TeamRetroInProgressRetroBoardOptionsDialogComponent } from './components/team-retro-in-progress-retro-board-options-dialog/team-retro-in-progress-retro-board-options-dialog-component';



@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    TeamRetroProcessInProgressRoutingModule,
    RoundProgressModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ],
  declarations: [
    TeamRetroProcessInProgressComponent,
    NavComponent,
    RetroProgressTimerComponent,
    ContentDropDragComponent,
    TeamRetroInProgressSnackbarComponent,
    TeamRetroInProgressSetTimeDialogComponent,
    AddNewActionBottomsheetComponent,
    TeamRetroInProgressShowActionDialogComponent,
    TeamRetroInProgressShowAllActionsDialogComponent,
    JoinToExistingTeamDialogComponent,
    TeamRetroInProgressUserWithoutRbWorkspaceDialogComponent,
    TeamRetroInProgressUserWithoutRbTeamDialogComponent,
    TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent,
    TeamRetroInProgressRetroBoardOptionsDialogComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  entryComponents: [
    TeamRetroInProgressSnackbarComponent,
    TeamRetroInProgressSetTimeDialogComponent,
    TeamRetroInProgressShowAllActionsDialogComponent,
    AddNewActionBottomsheetComponent,
    TeamRetroInProgressShowActionDialogComponent,
    JoinToExistingTeamDialogComponent,
    TeamRetroInProgressUserWithoutRbWorkspaceDialogComponent,
    TeamRetroInProgressUserWithoutRbTeamDialogComponent,
    TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent,
    TeamRetroInProgressRetroBoardOptionsDialogComponent
  ],
  providers: [
    FiresrtoreRetroProcessInProgressService
  ]
})
export class TeamRetroProcessInProgressModule { }
