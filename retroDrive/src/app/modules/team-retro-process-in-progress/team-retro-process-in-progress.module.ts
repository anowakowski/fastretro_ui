import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamRetroProcessInProgressComponent } from './team-retro-process-in-progress.component';
import { TestCompComponent } from './test-comp/test-comp.component';
import { NavComponent } from './components/nav/nav.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [TeamRetroProcessInProgressComponent, TestCompComponent, NavComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TeamRetroProcessInProgressModule { }
