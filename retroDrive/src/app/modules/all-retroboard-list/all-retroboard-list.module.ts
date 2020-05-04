import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllRetroboardListComponent } from './all-retroboard-list.component';
import { AllRetroboardListRoutingModule } from './all-retroboard-list-routing.module';
import { NavComponent } from './components/nav/nav.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

@NgModule({
  imports: [
    CommonModule,
    AllRetroboardListRoutingModule
  ],
  declarations: [AllRetroboardListComponent, NavComponent, SidenavComponent]
})
export class AllRetroboardListModule { }
