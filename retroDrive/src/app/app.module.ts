import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AngularFirestoreModule } from '@angular/fire/firestore';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { LoginRegisterGuard } from './guards/login-register.guard';
import { FirestoreBaseService } from './services/firestore-base.service';
import { DataPassingService } from './services/data-passing.service';
import { EventsService } from './services/events.service';

import { NgxSpinnerModule } from 'ngx-spinner';
import { LocalStorageService } from './services/local-storage.service';
import { SpinnerTickService } from './services/spinner-tick.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule
  ],
  providers: [
    AuthService,
    FirestoreBaseService,
    DataPassingService,
    EventsService,
    LocalStorageService,
    SpinnerTickService,
    AuthGuard,
    LoginRegisterGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
