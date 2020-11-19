import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {
  addNewEmailPassRegisterForm: FormGroup;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passFormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);

  shouldHideChoseLoginOptionForm = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private fls: FirestoreLoginRegisterService,
    private formBuilder: FormBuilder,
    private fbTokenService: FbTokenService,
    private loginRegisterErrorHandlingService: LoginRegisterErrorHandlingService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.createNewEmailPassRegisterForm();
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
