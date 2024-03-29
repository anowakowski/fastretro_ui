import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamRetroComponent } from './team-retro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TeamsComponent } from './components/teams/teams.component';
import { RetroProcessComponent } from './components/retro-process/retro-process.component';
import { AllRetroboardListComponent } from './components/all-retroboard-list/all-retroboard-list.component';
import { ViewAllNotificationsComponent } from './components/view-all-notifications/view-all-notifications.component';
import { BasicScrollComponent } from './components/basic-scroll/basic-scroll.component';
import { AllRetroBoardListWithVirtualScrollComponent } from './components/all-retroboard-list-with-virtual-scroll/all-retroboard-list-with-virtual-scroll.component';



const routes: Routes = [
  {
    path: '',
    component: TeamRetroComponent,
    children: [
      {path: 'dashboard', component: DashboardComponent},
      {path: 'teams', component: TeamsComponent},
      {path: 'process', component: RetroProcessComponent},
      // {path: 'all-retroboard-list', component: AllRetroboardListComponent},
      {path: 'all-retroboard-list', component: AllRetroBoardListWithVirtualScrollComponent},
      {path: 'all-your-notifications', component: ViewAllNotificationsComponent},
      {path: 'basic-scroll', component: BasicScrollComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRetroRegisterRoutingModule {}
