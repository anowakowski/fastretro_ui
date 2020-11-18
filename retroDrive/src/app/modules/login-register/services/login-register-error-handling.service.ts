import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterErrorHandlingService {

  private readonly emailArledyExists = 'auth/email-already-exists';
  private readonly insufficientPermission = 'auth/insufficient-permission';
  private readonly internalError = 'auth/internal-error';
  private readonly invalidCredential = 'auth/invalid-credential';
  private readonly invalidEmail = 'auth/invalid-email';
  private readonly invalidPassword = 'auth/invalid-password';

  private readonly messageInvalidEmail = 'The email address is not valid';

  constructor() { }

  getErrorMessage(firebaseAuthCode: string): string {
    let messeage;
    switch (firebaseAuthCode) {
      case this.emailArledyExists: {
        messeage = this.messageInvalidEmail;
        break;
      }
      case this.insufficientPermission: {
        //
        break;
      }
      case this.internalError: {
        //
        break;
      }
      case this.invalidCredential: {
        //
        break;
      }
      case this.invalidEmail: {
        //
        break;
      }
      case this.invalidPassword: {
        //
        break;
      }
      default: {
        //
        break;
      }
    }

    return messeage;
  }
}
