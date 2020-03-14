import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginRegisterGuard } from './guards/login-register.guard';


const routes: Routes = [
  { path: '', redirectTo: 'retro', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./modules/login-register/login-register.module').then( m => m.LoginRegisterModule),
    canActivate: [LoginRegisterGuard]
  },
  {
    path: 'retro',
    loadChildren: () => import('./modules/team-retro/team-retro.module').then( m => m.TeamRetroModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
