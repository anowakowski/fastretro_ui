import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterErrorHandlingService {

  private readonly emailArledyExistsCode = 'auth/email-already-exists';
  private readonly userNotFoundCode = 'auth/user-not-found';
  private readonly insufficientPermissionCode = 'auth/insufficient-permission';
  private readonly internalErrorCode = 'auth/internal-error';
  private readonly invalidCredentialCode = 'auth/invalid-credential';
  private readonly invalidEmailCode = 'auth/invalid-email';
  private readonly invalidPasswordCode = 'auth/invalid-password';
  private readonly wrongPasswordCode = 'auth/wrong-password';

  private readonly messageInvalidEmail = 'The email address is not valid';
  private readonly messageUserNotFound = 'User with given email not exist';
  private readonly messageUserISCurrentlyInUse = 'User with given email is currently exist';
  private readonly messageInvalidUserOrPass = 'Invalid user or password';

  private readonly messageSystemError = 'System error.';

  constructor() { }

  getErrorMessage(firebaseAuthCode: string): string {
    let messeage;
    switch (firebaseAuthCode) {
      case this.emailArledyExistsCode: {
        messeage = this.messageUserISCurrentlyInUse;
        break;
      }
      case this.userNotFoundCode: {
        messeage = this.messageUserNotFound;
        break;
      }
      case this.insufficientPermissionCode: {
        messeage = this.messageSystemError;
        break;
      }
      case this.internalErrorCode: {
        messeage = this.messageSystemError;
        break;
      }
      case this.invalidCredentialCode: {
        messeage = this.messageSystemError;
        break;
      }
      case this.invalidEmailCode: {
        messeage = this.messageInvalidEmail;
        break;
      }
      case this.invalidPasswordCode: {
        messeage = this.messageInvalidUserOrPass;
        break;
      }
      case this.wrongPasswordCode: {
        messeage = this.messageInvalidUserOrPass;
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
