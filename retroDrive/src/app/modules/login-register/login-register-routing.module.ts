import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginRegisterComponent } from './login-register.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';



const routes: Routes = [
  {
    path: '',
    component: LoginRegisterComponent
  },
  {
    path: 'register',
    component: RegisterFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRegisterRoutingModule {}
