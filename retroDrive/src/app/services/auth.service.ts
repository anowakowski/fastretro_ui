import { Injectable } from '@angular/core';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of, merge } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';

import { Router } from '@angular/router';

import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<any>;
  authState: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
    ) {
      this.user$ = afAuth.authState.pipe(
        switchMap(user => {
          if (user) {
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            return of(null);
          }
        })
      );

      afs.collection('/users').valueChanges().subscribe(usr => {
        let test = usr;
      });

      afs.collection('/courses').valueChanges().subscribe(usr => {
        let test = usr;
      });

      afAuth.authState.subscribe((authState) => {
        this.authState = authState;
      });
  }

  get authenticated(): boolean {
    // return this.user$ !== null;
    return this.authState !== null;
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  updateUserData(user: firebase.User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      splayName: user.displayName,
      photoURL: user.photoURL
    };

    return userRef.set(data, {merge: true});
  }

  isLoggedIn() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  async userState() {
    const user = await this.isLoggedIn();
    if (user) {
      return !user.uid;
    } else {
      return false;
   }
 }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/']);
      location.reload();
    });
  }

/*
  async signOut(): Promise<void> {
    return this.afAuth.auth.signOut();
  }
  */
}
