import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { ConditionQueryData } from 'src/app/helpers/conditionQueryData';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class FirestoreLoginRegisterService {

  constructor(private firestoreBaseService: FirestoreBaseService) { }

  findUsers(mail: string) {
    const condition: ConditionQueryData = {
      fieldName: 'email',
      conditionOperator: '==',
      value: mail
    };
    return this.firestoreBaseService.getFiltered('/users', condition);
  }

  updateUsr(user: User) {
    this.firestoreBaseService.updateUserData(user);
  }

}
