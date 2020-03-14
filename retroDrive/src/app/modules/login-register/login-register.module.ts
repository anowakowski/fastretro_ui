import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRegisterComponent } from './login-register.component';
import { LoginRegisterRoutingModule } from './login-register-routing.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    LoginRegisterRoutingModule,
    MatToolbarModule,
    MatIconModule
  ],
  declarations: [LoginRegisterComponent]
})
export class LoginRegisterModule { }
