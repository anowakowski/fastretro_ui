import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRegisterComponent } from './login-register.component';
import { LoginRegisterRoutingModule } from './login-register-routing.module';

@NgModule({
  imports: [
    CommonModule,
    LoginRegisterRoutingModule
  ],
  declarations: [LoginRegisterComponent]
})
export class LoginRegisterModule { }
