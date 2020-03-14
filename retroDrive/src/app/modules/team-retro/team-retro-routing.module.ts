import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamRetroComponent } from './team-retro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TeamsComponent } from './components/teams/teams.component';
import { RetroProcessComponent } from './components/retro-process/retro-process.component';



const routes: Routes = [
  {
    path: '',
    component: TeamRetroComponent,
    children: [
      {path: '', component: DashboardComponent},
      {path: 'teams', component: TeamsComponent},
      {path: 'process', component: RetroProcessComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRetroRegisterRoutingModule {}
