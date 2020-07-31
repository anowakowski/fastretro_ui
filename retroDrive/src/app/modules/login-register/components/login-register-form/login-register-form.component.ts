import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FirestoreLoginRegisterService } from '../../services/firestore-login-register.service';
import { User } from 'src/app/models/user';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShowInfoSnackbarComponent } from '../show-info-snackbar/show-info-snackbar.component';
import { FbTokenService } from 'src/app/services/fb-token.service';

@Component({
  selector: 'app-login-register-form',
  templateUrl: './login-register-form.component.html',
  styleUrls: ['./login-register-form.component.css'],
})
export class LoginRegisterFormComponent implements OnInit {
  addNewEmailPassLoginForm: FormGroup;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passFormControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
  shouldShowNotExisitngUserError = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private fls: FirestoreLoginRegisterService,
    private fbTokenService: FbTokenService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.createNewEmailPassLoginForm();
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
            .finally(() => {
              if (this.auth.urlToRedirect) {
                this.router.navigate([this.auth.urlToRedirect]);
              } else {
                this.router.navigate(['/']);
              }
            });
      }).catch(error => {
        this.openInfoSnackBar(true);
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
      chosenAvatarUrl: '',
    };
  }

  private openInfoSnackBar(shouldShowUserNotExistError: boolean) {
    const durationInSeconds = 5;
    this.snackBar.openFromComponent(ShowInfoSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        shouldShowUserNotExistError
      }
    });
  }
}
