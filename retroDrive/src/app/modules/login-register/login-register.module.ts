import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginRegisterComponent } from './login-register.component';
import { NavComponent } from './components/nav/nav.component';
import { LoginRegisterRoutingModule } from './login-register-routing.module';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'src/app/shared/material-module';
import { LoginRegisterFormComponent } from './components/login-register-form/login-register-form.component';
import { FirestoreLoginRegisterService } from './services/firestore-login-register.service';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { ShowInfoSnackbarComponent } from './components/show-info-snackbar/show-info-snackbar.component';
import { LoginRegisterErrorHandlingService } from './services/login-register-error-handling.service';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginRegisterRoutingModule,
    FlexLayoutModule,
    MaterialModule
  ],
  declarations: [LoginRegisterComponent, NavComponent, LoginRegisterFormComponent, RegisterFormComponent, ShowInfoSnackbarComponent],
  providers: [
    FirestoreLoginRegisterService,
    LoginRegisterErrorHandlingService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    ShowInfoSnackbarComponent
  ]
})
export class LoginRegisterModule { }
