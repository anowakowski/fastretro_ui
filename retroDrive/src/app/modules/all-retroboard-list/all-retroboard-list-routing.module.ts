import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllRetroboardListComponent } from './all-retroboard-list.component';


const routes: Routes = [
  {
    path: '',
    component: AllRetroboardListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllRetroboardListRoutingModule {}
