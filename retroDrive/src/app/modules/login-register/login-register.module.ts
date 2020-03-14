import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginRegisterComponent } from './login-register.component';
import { LoginRegisterRoutingModule } from './login-register-routing.module';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginRegisterRoutingModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule
  ],
  declarations: [LoginRegisterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginRegisterModule { }
