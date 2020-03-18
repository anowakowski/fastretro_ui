import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { AddNewRetroBoardBottomsheetComponent } from '../add-new-retro-board-bottomsheet/add-new-retro-board-bottomsheet.component';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-retro-process',
  templateUrl: './retro-process.component.html',
  styleUrls: ['./retro-process.component.css']
})
export class RetroProcessComponent implements OnInit {

  constructor(private bottomSheetRef: MatBottomSheet, private afs: AngularFirestore) { }

  ngOnInit() {
    // this.afs.collection('/users').valueChanges().subscribe(usr => {
    //   let test = usr;
    // });

    /*
    this.afs.collection('/courses').get().toPromise().then(snapshot => {
      snapshot.docs.forEach(doc => {
        console.log(doc.id);
        console.log(doc.data());
      });
    });
    */

    //this.addCourses();
    //this.deleteCourses();

    //this.getDocWithFilter();
    //this.updateCourses();

    //this.addedUserWithReferences();

    this.getDocWithRef();
  }

  getDocWithFilter(){
    this.afs.collection('/courses')
      .ref.where('name', '==', 'Piotrek')
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          console.log(doc.id);
          console.log(doc.data());
        });
      });
  }

  getDocWithOrdered(){
    this.afs.collection('/courses')
      .ref.orderBy('name')
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          console.log(doc.id);
          console.log(doc.data());
        });
      });
  }

  getDocWithRef(){
    this.afs.collection('/courses')
      .ref.where('name', '==', 'Konrad')
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          console.log(doc.id);
          console.log(doc.data());

          let usr = doc.data().user.get();

          usr.then(u => {
            let uread = u.data();
          });
        });
      });
  }

  deleteCourses() {
    this.afs.collection('/courses').doc('4tcxINXB374sz31jiBWR').delete();
  }


  addCourses() {
    let name = 'test1';
    let surname = 'test2';

    this.afs.collection('/courses').add({
      name: name,
      surname: surname
    });
  }

  addedUserWithReferences() {
    let usrId = 'AdzGvlqiKxcZKkBHdIgwdOmC9632';

    let courses = {
      name: 'Janek',
      surname: 'Nowak',
      user: this.afs.doc('users/' + usrId).ref
    };

    this.afs.collection('/courses').add(courses);
  }

  updateCourses() {
    this.afs.collection('/courses').doc('3MisVUmopAVBYJQEnVdn').update({
      name: 'testBleBleBle'
    });
  }

  openBottomSheet(): void {
    const bottomSheetRef = this.bottomSheetRef.open(AddNewRetroBoardBottomsheetComponent);

    bottomSheetRef.afterDismissed().subscribe(() => {
      console.log('Bottom sheet has been dismissed.');
    });
  }

}
