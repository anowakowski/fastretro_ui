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

import { NgxSpinnerModule } from 'ngx-spinner';
import { LoaddingSingleElementsSpinnerComponent } from './components/loadding-single-elements-spinner/loadding-single-elements-spinner.component';
import { NewUserWizardComponent } from './components/new-user-wizard/new-user-wizard.component';
import { WelcomeInfoNewUsersDashboardDialogComponent } from './components/welcome-info-new-users-dashboard-dialog/welcome-info-new-users-dashboard-dialog.component';
import { NewUserWiazrdInfoDialogComponent } from './components/new-user-wiazrd-info-dialog/new-user-wiazrd-info-dialog.component';
import { ValueDataValidator } from './components/new-user-wizard/valueDataValidator';
import { CreateNewTeamBottomsheetComponent } from './components/create-new-team-bottomsheet/create-new-team-bottomsheet.component';

@NgModule({
  imports: [
    CommonModule,
    TeamRetroRegisterRoutingModule,
    FlexLayoutModule,
    MaterialModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule

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
    MyTestCompComponent,
    LoaddingSingleElementsSpinnerComponent,
    NewUserWizardComponent,
    WelcomeInfoNewUsersDashboardDialogComponent,
    NewUserWiazrdInfoDialogComponent,
    ValueDataValidator,
    CreateNewTeamBottomsheetComponent
  ],
  entryComponents: [
    AddNewRetroBoardBottomsheetComponent,
    RetroBoardSnackbarComponent,
    WelcomeInfoNewUsersDashboardDialogComponent,
    NewUserWiazrdInfoDialogComponent,
    CreateNewTeamBottomsheetComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    FirestoreRetroBoardService
  ]
})
export class TeamRetroModule { }
