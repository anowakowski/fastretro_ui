import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FirestoreLoginRegisterService } from '../../services/firestore-login-register.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login-register-form',
  templateUrl: './login-register-form.component.html',
  styleUrls: ['./login-register-form.component.css']
})
export class LoginRegisterFormComponent implements OnInit {

  constructor(public auth: AuthService, private router: Router, private fls: FirestoreLoginRegisterService) { }

  ngOnInit() {
  }

  login() {
    this.auth.googleSignin().then((userCredentials) => {
      const logedUser = userCredentials.user;
      this.fls.findUsers(logedUser.email)
        .then(snapshotFindedUsr => {
          if (snapshotFindedUsr.docs.length === 0) {
            
            const logedUserModel: User = {
              uid: logedUser.uid,
              email: logedUser.email,
              splayName: logedUser.displayName,
              photoURL: logedUser.photoURL,
              isNewUser: true,
              chosenAvatarUrl: ''
            };

            this.fls.updateUsr(logedUserModel);
          }
        }).finally(() => {
          this.router.navigate(['/']);
        });
    });
  }

}
