import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'src/app/shared/material-module';
import { NavComponent } from './components/nav/nav.component';

import { SlidenavComponent } from './components/slidenav/slidenav.component';
import { TeamRetroRegisterRoutingModule } from './team-retro-routing.module';
import { TeamRetroComponent } from './team-retro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TeamsComponent } from './components/teams/teams.component';
import { RetroProcessComponent } from './components/retro-process/retro-process.component';
import { ChartsModule } from 'ng2-charts';
import { SidenavUsercardComponent } from './components/sidenav-usercard/sidenav-usercard.component';
// tslint:disable-next-line:max-line-length
import { AddNewRetroBoardBottomsheetComponent } from './components/add-new-retro-board-bottomsheet/add-new-retro-board-bottomsheet.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { FirestoreRetroBoardService } from './services/firestore-retro-board.service';
import { RetroBoardSnackbarComponent } from './components/retro-board-snackbar/retro-board-snackbar.component';
import { MyTestCompComponent } from './components/my-test-comp/my-test-comp.component';


@NgModule({
  imports: [
    CommonModule,
    TeamRetroRegisterRoutingModule,
    FlexLayoutModule,
    MaterialModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule

  ],
  declarations: [
    TeamRetroComponent,
    NavComponent,
    SlidenavComponent,
    DashboardComponent,
    TeamsComponent,
    RetroProcessComponent,
    SidenavUsercardComponent,
    AddNewRetroBoardBottomsheetComponent,
    RetroBoardSnackbarComponent,
    MyTestCompComponent
  ],
  entryComponents: [
    AddNewRetroBoardBottomsheetComponent,
    RetroBoardSnackbarComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    FirestoreRetroBoardService
  ]
})
export class TeamRetroModule { }
