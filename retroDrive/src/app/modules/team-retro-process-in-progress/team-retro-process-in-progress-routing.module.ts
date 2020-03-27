import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamRetroProcessInProgressComponent } from './team-retro-process-in-progress.component';

const routes: Routes = [
  {
    path: '',
    component: TeamRetroProcessInProgressComponent,

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRetroProcessInProgressRoutingModule {}
