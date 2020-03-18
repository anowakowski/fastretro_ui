import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreRetroBoardService {

  private colName = '/retroBoards';
  constructor(private firestoreBase: FirestoreBaseService) { }

  addNewRetroBoard(newRetroBoard) {
    this.firestoreBase.addNewItem(this.colName, newRetroBoard);
  }
}
