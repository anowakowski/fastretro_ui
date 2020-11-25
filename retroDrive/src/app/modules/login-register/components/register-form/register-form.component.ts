import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FirestoreLoginRegisterService } from '../../services/firestore-login-register.service';
import { User } from 'src/app/models/user';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { FbTokenService } from 'src/app/services/fb-token.service';
import { ShowInfoSnackbarComponent } from '../show-info-snackbar/show-info-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { UserSettings } from 'src/app/models/UserSettings';
import { LoginRegisterErrorHandlingService } from '../../services/login-register-error-handling.service';

import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit, OnDestroy {
  addNewEmailPassRegisterForm: FormGroup;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passFormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);

  shouldHideChoseLoginOptionForm = false;

  mediaSub: Subscription;
  devicesXs: boolean;
  devicesSm: boolean;
  devicesMd: boolean;
  devicesLg: boolean;
  devicesXl: boolean;

  constructor(
    public auth: AuthService,
    private router: Router,
    private fls: FirestoreLoginRegisterService,
    private formBuilder: FormBuilder,
    private fbTokenService: FbTokenService,
    private loginRegisterErrorHandlingService: LoginRegisterErrorHandlingService,
    private snackBar: MatSnackBar,
    public mediaObserver: MediaObserver) { }

  ngOnInit() {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.devicesXs = result.mqAlias === 'xs' ? true : false;
      this.devicesSm = result.mqAlias === 'sm' ? true : false;
      this.devicesMd = result.mqAlias === 'md' ? true : false;
      this.devicesLg = result.mqAlias === 'lg' ? true : false;
      this.devicesXl = result.mqAlias === 'xl' ? true : false;
    });
    this.createNewEmailPassRegisterForm();
  }

  ngOnDestroy(): void {
    this.mediaSub.unsubscribe();
  }

  continueWithMail() {
    this.shouldHideChoseLoginOptionForm = true;
  }

  CreateUserByEmailAndPass() {
    const emailVaule = this.addNewEmailPassRegisterForm.value.emailFormControl;
    const passValue = this.addNewEmailPassRegisterForm.value.passFormControl;

    this.auth.emailSigUp(emailVaule, passValue)
      .then((userCredentials) => {
        const logedUser = userCredentials.user;
        this.fls.findUsers(logedUser.email)
          .then(snapshotFindedUsr => {
            if (snapshotFindedUsr.docs.length === 0) {
              const logedUserModel: User = this.prepareUserModel(logedUser);
              this.fbTokenService.prepareToken(userCredentials.user.refreshToken);
              this.fls.updateUsr(logedUserModel);
            }
          })
          .finally(() => {
            this.router.navigate(['/']);
          });
      })
      .catch(error => {
        const message = this.loginRegisterErrorHandlingService.getErrorMessage(error.code);
        this.openInfoSnackBar(message, true);
      });
  }

  createNewEmailPassRegisterForm() {
    this.addNewEmailPassRegisterForm = this.formBuilder.group({
      emailFormControl: this.emailFormControl,
      passFormControl: this.passFormControl
    });
  }

  loginByGoogle() {
    this.auth.googleSignin()
      .then((userCredentials) => {
        const logedUser = userCredentials.user;
        this.fls
          .findUsers(logedUser.email)
          .then((snapshotFindedUsr) => {
            if (snapshotFindedUsr.docs.length === 0) {
              const logedUserModel: User = this.prepareUserModel(logedUser);
              this.fls.updateUsr(logedUserModel);
            }
          })
          .catch(error => {
            const message = this.loginRegisterErrorHandlingService.getErrorMessage(error.code);
            this.openInfoSnackBar(message, true);
          })
          .finally(() => {
            this.router.navigate(['/']);
          });
    }).catch(error => {
      const message = this.loginRegisterErrorHandlingService.getErrorMessage(error.code);
      this.openInfoSnackBar(message, true);
    });
  }

  loginByFacebook() {
    this.auth.facebookSignin()
      .then((userCredentials) => {
        const logedUser = userCredentials.user;
        this.fls
          .findUsers(logedUser.email)
          .then((snapshotFindedUsr) => {
            if (snapshotFindedUsr.docs.length === 0) {
              const logedUserModel: User = this.prepareUserModel(logedUser);
              this.fls.updateUsr(logedUserModel);
            }
          })
          .finally(() => {
            this.router.navigate(['/']);
          });
    }).catch(error => {
      const message = this.loginRegisterErrorHandlingService.getErrorMessage(error.code);
      this.openInfoSnackBar(message, true);
    });
  }

  private openInfoSnackBar(message: string, isWarrning: boolean) {
    const durationInSeconds = 5;
    this.snackBar.openFromComponent(ShowInfoSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        isWarrning,
        message
      }
    });
  }

  private prepareUserModel(logedUser): User {
    return {
      uid: logedUser.uid,
      email: logedUser.email,
      splayName: logedUser.displayName,
      photoURL: logedUser.photoURL,
      isNewUser: true,
      chosenAvatarName: ''
    };
  }
}
