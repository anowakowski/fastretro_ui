import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllRetroboardListComponent } from './all-retroboard-list.component';
import { AllRetroboardListRoutingModule } from './all-retroboard-list-routing.module';

@NgModule({
  imports: [
    CommonModule,
    AllRetroboardListRoutingModule
  ],
  declarations: [AllRetroboardListComponent]
})
export class AllRetroboardListModule { }
