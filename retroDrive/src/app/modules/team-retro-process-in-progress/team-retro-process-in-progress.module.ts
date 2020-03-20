import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamRetroProcessInProgressComponent } from './team-retro-process-in-progress.component';
import { NavComponent } from './components/nav/nav.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'src/app/shared/material-module';
import { TeamRetroProcessInProgressRoutingModule } from './team-retro-process-in-progress-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    TeamRetroProcessInProgressRoutingModule
  ],
  declarations: [TeamRetroProcessInProgressComponent, NavComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TeamRetroProcessInProgressModule { }
