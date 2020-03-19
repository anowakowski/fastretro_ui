import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamRetroProcessInProgressComponent } from './team-retro-process-in-progress.component';
import { TeamRetroProcessInProgressRoutingModule } from './team-retro-process-in-progress-routing.module';

@NgModule({
  imports: [
    CommonModule,
    TeamRetroProcessInProgressRoutingModule
  ],
  declarations: [TeamRetroProcessInProgressComponent]
})
export class TeamRetroProcessInProgressModule { }
