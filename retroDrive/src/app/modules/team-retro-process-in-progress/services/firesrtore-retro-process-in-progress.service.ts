import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';

@Injectable({
  providedIn: 'root'
})
export class FiresrtoreRetroProcessInProgressService {

  constructor(private firestoreBase: FirestoreBaseService) { }

  addNewRetroBoardCard(newRetroBoardCard) {
    this.firestoreBase.addNewItem('/retroBoardCards/', newRetroBoardCard);
  }

}
