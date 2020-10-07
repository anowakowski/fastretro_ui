import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, FieldPath, AngularFirestoreDocument } from '@angular/fire/firestore';
import { tap } from 'rxjs/operators';
import { ConditionQueryData } from '../helpers/conditionQueryData';
import { User } from '../models/user';

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
    return this.afs.collection(collectionName).add(newItem);
  }

  updateItem(collectionName: string, docId: any, itemToUpdate: any) {
    return this.afs.collection(collectionName).doc(docId).update(itemToUpdate);
  }

  deleteItem(collectionName: string, docId: any) {
    return this.afs.collection(collectionName).doc(docId).delete();
  }

  addAsRef(collectionName: string, docId: string): DocumentReference {
    return this.afs.doc(collectionName + docId).ref;
  }

  getFiltered(collectionName: string, condition: ConditionQueryData) {
    return this.afs.collection(
      collectionName,
      ref => ref.where(condition.fieldName, condition.conditionOperator, condition.value))
    .get()
    .toPromise();
  }

  getFilteredById(collectionName: string, id: string) {
    return this.afs.collection(collectionName).doc(id).ref.get();
  }

  getFilteredSnapshotChanges(collectionName: string, condition: ConditionQueryData) {
    return this.afs.collection(
        collectionName,
        ref => ref.where(condition.fieldName, condition.conditionOperator, condition.value))
      .snapshotChanges();
  }

  getFilteredSnapshotChangesForBatch(
    collectionName: string,
    condition: ConditionQueryData,
    batchSize,
    lastSeen,
    shouldUseFilters = false,
    additionalCondition: ConditionQueryData) {

      if (shouldUseFilters) {
        return this.getBaseBatchWithFilters(collectionName, condition, lastSeen, batchSize, additionalCondition);
      } else {
        return this.getBaseBatchWithoutFilters(collectionName, condition, lastSeen, batchSize);
      }
  }

  getBaseBatchWithoutFilters(collectionName: string, condition: ConditionQueryData, lastSeen: any, batchSize: any) {
    return this.afs.collection(
      collectionName,
      ref => ref
        .where(condition.fieldName, condition.conditionOperator, condition.value)
        .orderBy('creationDate')
        .startAfter(lastSeen)
        .limit(batchSize)
    )
      .snapshotChanges();
  }

  getBaseBatchWithFilters(
    collectionName: string, baseCondition: ConditionQueryData, lastSeen: any, batchSize: any, additionalCondition: ConditionQueryData) {
    return this.afs.collection(
      collectionName,
      ref => ref
        .where(baseCondition.fieldName, baseCondition.conditionOperator, baseCondition.value)
        .where(additionalCondition.fieldName, additionalCondition.conditionOperator, additionalCondition.value)
        .orderBy('creationDate')
        .startAfter(lastSeen)
        .limit(batchSize)
    )
      .snapshotChanges();
  }

  getFilteredByIdSnapshotChanges(collectionName: string, id: string) {
    return this.afs.collection(collectionName).doc(id).snapshotChanges();
  }

  snapshotChanges(collectionName: string) {
    return this.afs.collection(collectionName).snapshotChanges();
  }

  updateUserData(user: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    userRef.set(user, {merge: true});
    // return userRef.get().toPromise();
  }
}

