import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { ConditionQueryData } from 'src/app/helpers/conditionQueryData';

@Injectable({
  providedIn: 'root'
})
export class FiresrtoreRetroProcessInProgressService {

  constructor(private firestoreBase: FirestoreBaseService) { }

  addNewRetroBoardCard(newRetroBoardCard) {
    return this.firestoreBase.addNewItem('/retroBoardCards/', newRetroBoardCard);
  }

  updateRetroBoardCard(cardToUpdate: any, id: string) {
    this.firestoreBase.updateItem('/retroBoardCards/', id, cardToUpdate);
  }

  findRetroBoardByUrlParamId(urlParamId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'urlParamId',
      conditionOperator: '==',
      value: urlParamId
    };

    return this.firestoreBase.getFiltered('/retroBoards/', condition);
  }

  findRetroBoardCardById(docId: string) {
    return this.firestoreBase.getFilteredById('/retroBoardCards/', docId);
  }

  addRetroBoardAsRef(retroBoardId: string) {
    return this.firestoreBase.addAsRef('/retroBoards/', retroBoardId);
  }

  addUserAsRef(uid: string) {
    return this.firestoreBase.addAsRef('/users/', uid);
  }

  retroBoardCardsFilteredSnapshotChanges() {
    return this.firestoreBase.snapshotChanges('/retroBoardCards/');
  }

  removeRetroBoardCard(id: string) {
    this.firestoreBase.deleteItem('/retroBoardCards/', id);
  }
}
