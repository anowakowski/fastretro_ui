import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FirestoreLoginRegisterService } from '../../services/firestore-login-register.service';
import { User } from 'src/app/models/user';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShowInfoSnackbarComponent } from '../show-info-snackbar/show-info-snackbar.component';
import { FbTokenService } from 'src/app/services/fb-token.service';
import { LoginRegisterErrorHandlingService } from '../../services/login-register-error-handling.service';

import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-login-register-form',
  templateUrl: './login-register-form.component.html',
  styleUrls: ['./login-register-form.component.css'],
})
export class LoginRegisterFormComponent implements OnInit, OnDestroy {
  addNewEmailPassLoginForm: FormGroup;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passFormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
  shouldShowNotExisitngUserError = false;

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
    private fbTokenService: FbTokenService,
    private loginRegisterErrorHandlingService: LoginRegisterErrorHandlingService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public mediaObserver: MediaObserver
  ) {}

  ngOnInit() {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.devicesXs = result.mqAlias === 'xs' ? true : false;
      this.devicesSm = result.mqAlias === 'sm' ? true : false;
      this.devicesMd = result.mqAlias === 'md' ? true : false;
      this.devicesLg = result.mqAlias === 'lg' ? true : false;
      this.devicesXl = result.mqAlias === 'xl' ? true : false;
    });
    this.createNewEmailPassLoginForm();
  }

  ngOnDestroy(): void {
    this.mediaSub.unsubscribe();
  }

  loginByGoogle() {
    this.auth.googleSignin()
      .then((userCredentials) => {
        const logedUser = userCredentials.user;
        this.fbTokenService.prepareToken(userCredentials.user.refreshToken);
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
      const errorForm = error;
    });
  }

  loginByFacebook() {
    this.auth.facebookSignin()
      .then((userCredentials) => {
        const logedUser = userCredentials.user;
        this.fbTokenService.prepareToken(userCredentials.user.refreshToken);
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
      const errorForm = error;
    });
  }

  loginByEmailAndPass() {
    if (true) {
      const emailVaule = this.addNewEmailPassLoginForm.value.emailFormControl;
      const passValue = this.addNewEmailPassLoginForm.value.passFormControl;

      this.auth.emailSigIn(emailVaule, passValue)
        .then((userCredentials) => {
          const logedUser = userCredentials.user;
          this.fbTokenService.prepareToken(userCredentials.user.refreshToken);
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
              if (this.auth.urlToRedirect) {
                this.router.navigate([this.auth.urlToRedirect]);
              } else {
                this.router.navigate(['/']);
              }
            });
      }).catch(error => {
        const message = this.loginRegisterErrorHandlingService.getErrorMessage(error.code);
        this.openInfoSnackBar(message, true);
      });
    }
  }

  createNewEmailPassLoginForm() {
    this.addNewEmailPassLoginForm = this.formBuilder.group({
      emailFormControl: this.emailFormControl,
      passFormControl: this.passFormControl,
    });
  }

  private prepareUserModel(logedUser): User {
    return {
      uid: logedUser.uid,
      email: logedUser.email,
      splayName: logedUser.displayName,
      photoURL: logedUser.photoURL,
      isNewUser: true,
      chosenAvatarName: '',
    };
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
}
