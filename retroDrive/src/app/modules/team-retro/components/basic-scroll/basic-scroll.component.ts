import { Component, OnInit, ViewChild } from '@angular/core';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { BehaviorSubject, Observable } from 'rxjs';

import { AngularFirestore, DocumentReference, FieldPath, AngularFirestoreDocument } from '@angular/fire/firestore';
import { map, mergeMap, scan, tap, throttleTime } from 'rxjs/operators';

const batchSize = 20;

@Component({
  selector: 'app-basic-scroll',
  templateUrl: './basic-scroll.component.html',
  styleUrls: ['./basic-scroll.component.scss']
})
export class BasicScrollComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  // people: any[];

  people: any[];

  theEnd = false;

  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;

  constructor(private db: AngularFirestore) {

    // this.db.collection('/people/').add({
    //   name: 'test2',
    //   bio: 'sdfsd sdmslkfmsd mfkdslmklfdskmfdskl fsd',
    //   emoji: 'dsdfbsdfsbdfhsbdfbdsffds'
    // });

    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap(n => this.getBatch(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );

    this.infinite = batchMap.pipe(map(v => Object.values(v)));

    // this.viewport.scrollToIndex(23);

    // this.people = Array(100)
    //   .fill(1)
    //   .map(_ => {
    //     return {
    //       name: 'test1',
    //       bio: 'test2',
    //       emoji: 'test3'
    //     };
    //   });
  }

  ngOnInit() {
  }

  nextBatch(e, offset) {
    if (this.theEnd) {
      return;
    }

    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();

    if (end === total) {
      this.offset.next(offset);
    }
  }

  trackByIdx(i) {
    return i;
  }

  getBatch(lastSeen: string) {
    return this.db.collection('people', ref =>
      ref
        .orderBy('name')
        .startAfter(lastSeen)
        .limit(batchSize)
    )
    .snapshotChanges()
    .pipe(
      tap(arr => (arr.length ? null : (this.theEnd = true))),
      map(arr => {
        return arr.reduce((acc, cur) => {
          const id = cur.payload.doc.id;
          const data = cur.payload.doc.data();
          return { ...acc, [id]: data };
        }, {});
      })

    );
  }

}
