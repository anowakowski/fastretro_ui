import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamRetroComponent } from './team-retro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';



const routes: Routes = [
  {
    path: '',
    component: TeamRetroComponent,
    children: [
      {path: '', component: DashboardComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRetroRegisterRoutingModule {}
