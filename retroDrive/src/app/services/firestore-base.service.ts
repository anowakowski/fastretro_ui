import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, FieldPath } from '@angular/fire/firestore';
import { ConditionQueryData } from '../helpers/conditionQueryData';

@Injectable({
  providedIn: 'root'
})
export class FirestoreBaseService {

  constructor(private afs: AngularFirestore) { }

  getAll(collectionName: string) {
    return this.afs.collection(collectionName)
      .get()
      .toPromise();
  }

  addNewItem(collectionName: string, newItem: any) {
    this.afs.collection(collectionName).add(newItem);
  }

  updateItem(collectionName: string, docId: any, itemToUpdate: any) {
    this.afs.collection(collectionName).doc(docId).update(itemToUpdate);
  }

  deleteItem(collectionName: string, docId: any) {
    this.afs.collection(collectionName).doc(docId).delete();
  }

  addAsRef(collectionName: string, docId: string): DocumentReference {
    return this.afs.doc(collectionName + docId).ref;
  }

  getFilteredSnapshotChanges(collectionName: string, condition: ConditionQueryData) {
    return this.afs.collection(
        collectionName,
        ref => ref.where(condition.fieldName, condition.conditionOperator, condition.value))
      .snapshotChanges();
  }

  snapshotChanges(collectionName: string) {
    return this.afs.collection(collectionName).snapshotChanges();
  }
}

