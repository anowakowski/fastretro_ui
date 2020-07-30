import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamRetroComponent } from './team-retro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TeamsComponent } from './components/teams/teams.component';
import { RetroProcessComponent } from './components/retro-process/retro-process.component';
import { AllRetroboardListComponent } from './components/all-retroboard-list/all-retroboard-list.component';
import { ViewAllNotificationsComponent } from './components/view-all-notifications/view-all-notifications.component';



const routes: Routes = [
  {
    path: '',
    component: TeamRetroComponent,
    children: [
      {path: '', component: DashboardComponent},
      {path: 'teams', component: TeamsComponent},
      {path: 'process', component: RetroProcessComponent},
      {path: 'all-retroboard-list', component: AllRetroboardListComponent},
      {path: 'all-your-notifications', component: ViewAllNotificationsComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRetroRegisterRoutingModule {}
