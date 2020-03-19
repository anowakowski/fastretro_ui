import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginRegisterGuard } from './guards/login-register.guard';
import { DataResolverService } from './resolvers/data-resolver.service';


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
  },
  {
    path: 'retro-in-progress/',
    loadChildren: () => import('./modules/team-retro-process-in-progress/team-retro-process-in-progress-routing.module')
      .then( m => m.TeamRetroProcessInProgressRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'retro-in-progress/:id',
    resolve: {
      retroBoardData: DataResolverService
    },
    loadChildren: () => import('./modules/team-retro-process-in-progress/team-retro-process-in-progress-routing.module')
      .then( m => m.TeamRetroProcessInProgressRoutingModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
