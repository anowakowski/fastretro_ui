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
// tslint:disable-next-line:max-line-length
import { LoaddingSingleElementsSpinnerComponent } from './components/loadding-single-elements-spinner/loadding-single-elements-spinner.component';
import { NewUserWizardComponent } from './components/new-user-wizard/new-user-wizard.component';
// tslint:disable-next-line:max-line-length
import { WelcomeInfoNewUsersDashboardDialogComponent } from './components/welcome-info-new-users-dashboard-dialog/welcome-info-new-users-dashboard-dialog.component';
import { NewUserWiazrdInfoDialogComponent } from './components/new-user-wiazrd-info-dialog/new-user-wiazrd-info-dialog.component';
import { ValueDataValidator } from './components/new-user-wizard/valueDataValidator';
import { CreateNewTeamBottomsheetComponent } from './components/create-new-team-bottomsheet/create-new-team-bottomsheet.component';
import { AllRetroboardListComponent } from './components/all-retroboard-list/all-retroboard-list.component';
// tslint:disable-next-line:max-line-length
import { JoinToExistingWorkspaceDialogComponent } from './components/join-to-existing-workspace-dialog/join-to-existing-workspace-dialog.component';
// tslint:disable-next-line:max-line-length
import { ChangeCurrentUserWorksapceDialogComponent } from './components/change-current-user-worksapce-dialog/change-current-user-worksapce-dialog.component';
// tslint:disable-next-line:max-line-length
import { UserNotificationDetailsDialogComponent } from './components/user-notification-details-dialog/user-notification-details-dialog.component';
import { ViewAllNotificationsComponent } from './components/view-all-notifications/view-all-notifications.component';
import { CreateNewWorkspaceBottomsheetComponent } from './components/create-new-workspace-bottomsheet/create-new-workspace-bottomsheet.component';

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
    CreateNewTeamBottomsheetComponent,
    AllRetroboardListComponent,
    JoinToExistingWorkspaceDialogComponent,
    ChangeCurrentUserWorksapceDialogComponent,
    UserNotificationDetailsDialogComponent,
    ViewAllNotificationsComponent,
    CreateNewWorkspaceBottomsheetComponent
  ],
  entryComponents: [
    AddNewRetroBoardBottomsheetComponent,
    RetroBoardSnackbarComponent,
    WelcomeInfoNewUsersDashboardDialogComponent,
    NewUserWiazrdInfoDialogComponent,
    CreateNewTeamBottomsheetComponent,
    JoinToExistingWorkspaceDialogComponent,
    ChangeCurrentUserWorksapceDialogComponent,
    UserNotificationDetailsDialogComponent,
    CreateNewWorkspaceBottomsheetComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    FirestoreRetroBoardService
  ]
})
export class TeamRetroModule { }
