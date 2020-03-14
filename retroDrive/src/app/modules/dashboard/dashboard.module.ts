import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRegisterRoutingModule } from './dashboard-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'src/app/shared/material-module';
import { NavComponent } from './components/nav/nav.component';
import { SlidenavComponent } from './components/slidenav/slidenav.component';


@NgModule({
  imports: [
    CommonModule,
    DashboardRegisterRoutingModule,
    FlexLayoutModule,
    MaterialModule
  ],
  declarations: [DashboardComponent, NavComponent, SlidenavComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
