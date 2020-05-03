import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FirestoreLoginRegisterService } from '../../services/firestore-login-register.service';
import { User } from 'src/app/models/user';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-register-form',
  templateUrl: './login-register-form.component.html',
  styleUrls: ['./login-register-form.component.css']
})
export class LoginRegisterFormComponent implements OnInit {

  addNewEmailPassLoginForm: FormGroup;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passFormControl = new FormControl('', [Validators.required, Validators.minLength(8)]);

  constructor(
    public auth: AuthService,
    private router: Router,
    private fls: FirestoreLoginRegisterService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createNewEmailPassLoginForm();
  }

  loginByGoogle() {
    if (this.addNewEmailPassLoginForm.valid) {
      this.auth.googleSignin().then((userCredentials) => {
        const logedUser = userCredentials.user;
        this.fls.findUsers(logedUser.email)
          .then(snapshotFindedUsr => {
            if (snapshotFindedUsr.docs.length === 0) {
              const logedUserModel: User = this.prepareUserModel(logedUser);
              this.fls.updateUsr(logedUserModel);
            }
          }).finally(() => {
            this.router.navigate(['/']);
          });
      });
    }
  }

  loginByEmailAndPass() {
    if (this.addNewEmailPassLoginForm.valid) {
      const emailVaule = this.addNewEmailPassLoginForm.value.emailFormControl;
      const passValue = this.addNewEmailPassLoginForm.value.passFormControl;

      this.auth.emailSigIn(emailVaule, passValue).then((userCredentials) => {
        const logedUser = userCredentials.user;
        this.fls.findUsers(logedUser.email)
          .then(snapshotFindedUsr => {
            if (snapshotFindedUsr.docs.length === 0) {
              const logedUserModel: User = this.prepareUserModel(logedUser);
              this.fls.updateUsr(logedUserModel);
            }
          }).finally(() => {
            this.router.navigate(['/']);
          });
      });
    }
  }

  createNewEmailPassLoginForm() {
    this.addNewEmailPassLoginForm = this.formBuilder.group({
      emailFormControl: this.emailFormControl,
      passFormControl: this.passFormControl
    });
  }

  private prepareUserModel(logedUser): User {
    return {
      uid: logedUser.uid,
      email: logedUser.email,
      splayName: logedUser.displayName,
      photoURL: logedUser.photoURL,
      isNewUser: true,
      chosenAvatarUrl: ''
    };
  }
}
