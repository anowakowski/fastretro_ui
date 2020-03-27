import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, FieldPath, AngularFirestoreDocument } from '@angular/fire/firestore';
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

  getFiltered(collectionName: string, condition: ConditionQueryData) {
    return this.afs.collection(
      collectionName,
      ref => ref.where(condition.fieldName, condition.conditionOperator, condition.value))
    .get()
    .toPromise();
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

  updateUserData(user: firebase.User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      splayName: user.displayName,
      photoURL: user.photoURL,
      isNewUser: true
    };

    userRef.set(data, {merge: true});
    //return userRef.get().toPromise();
  }
}

