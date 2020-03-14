import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRegisterRoutingModule } from './dashboard-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'src/app/shared/material-module';

@NgModule({
  imports: [
    CommonModule,
    DashboardRegisterRoutingModule,
    FlexLayoutModule,
    MaterialModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
