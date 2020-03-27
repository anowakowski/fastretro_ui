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
import { TeamRetroInProgressSnackbarComponent }
  from './components/team-retro-in-progress-snackbar/team-retro-in-progress-snackbar.component';
import { TeamRetroInProgressSetTimeDialogComponent }
  from './components/team-retro-in-progress-set-time-dialog/team-retro-in-progress-set-time-dialog.component';
import { TeamRetroInProgressAddCardActionDialogComponent } from './components/team-retro-in-progress-add-card-action-dialog/team-retro-in-progress-add-card-action-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    TeamRetroProcessInProgressRoutingModule,
    RoundProgressModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    TeamRetroProcessInProgressComponent,
    NavComponent,
    RetroProgressTimerComponent,
    ContentDropDragComponent,
    TeamRetroInProgressSnackbarComponent,
    TeamRetroInProgressSetTimeDialogComponent,
    TeamRetroInProgressAddCardActionDialogComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  entryComponents: [
    TeamRetroInProgressSnackbarComponent,
    TeamRetroInProgressSetTimeDialogComponent,
    TeamRetroInProgressAddCardActionDialogComponent
  ]
})
export class TeamRetroProcessInProgressModule { }
