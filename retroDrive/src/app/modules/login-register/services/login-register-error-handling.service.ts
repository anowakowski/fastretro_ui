import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterErrorHandlingService {

  private readonly emailArledyExists = 'auth/email-already-exists';
  private readonly userNotFound = 'auth/user-not-found';
  private readonly insufficientPermission = 'auth/insufficient-permission';
  private readonly internalError = 'auth/internal-error';
  private readonly invalidCredential = 'auth/invalid-credential';
  private readonly invalidEmail = 'auth/invalid-email';
  private readonly invalidPassword = 'auth/invalid-password';

  private readonly messageInvalidEmail = 'The email address is not valid';
  private readonly messageUserNotFound = 'User with given email not exist';
  private readonly messageUserISCurrentlyInUse = 'User with given email is currently exist';

  private readonly messageSystemError = 'Internal system error - contact with administration.';

  constructor() { }

  getErrorMessage(firebaseAuthCode: string): string {
    let messeage;
    switch (firebaseAuthCode) {
      case this.emailArledyExists: {
        messeage = this.messageUserISCurrentlyInUse;
        break;
      }
      case this.userNotFound: {
        messeage = this.messageUserNotFound;
        break;
      }
      case this.insufficientPermission: {
        messeage = this.messageSystemError;
        break;
      }
      case this.internalError: {
        messeage = this.messageSystemError;
        break;
      }
      case this.invalidCredential: {
        messeage = this.messageSystemError;
        break;
      }
      case this.invalidEmail: {
        messeage = this.messageInvalidEmail;
        break;
      }
      case this.invalidPassword: {
        messeage = this.messageSystemError;
        break;
      }
      default: {
        messeage = this.messageSystemError;
        break;
      }
    }

    return messeage;
  }
}
