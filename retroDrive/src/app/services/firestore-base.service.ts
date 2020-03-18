import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreBaseService {

  constructor(private afs: AngularFirestore, collectionName) { }

  getAll(collectionName: string): Promise<any> {
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
}
