import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { AddNewRetroBoardBottomsheetComponent } from '../add-new-retro-board-bottomsheet/add-new-retro-board-bottomsheet.component';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { RetroBoard } from 'src/app/models/retroBoard';

@Component({
  selector: 'app-retro-process',
  templateUrl: './retro-process.component.html',
  styleUrls: ['./retro-process.component.css']
})
export class RetroProcessComponent implements OnInit {

  retroBoards: RetroBoard[];
  retroBoardSubscriptions: any;

  constructor(private bottomSheetRef: MatBottomSheet, private frbs: FirestoreRetroBoardService) { }

  ngOnInit() {
    this.retroBoardSubscriptions = this.frbs.retroBoardSnapshotChanges();
    this.prepareRetroBoard();
  }

  openBottomSheet(): void {
    const bottomSheetRef = this.bottomSheetRef.open(AddNewRetroBoardBottomsheetComponent);

    bottomSheetRef.afterDismissed().subscribe(() => {
      console.log('Bottom sheet has been dismissed.');
    });
  }

  private prepareRetroBoard() {
    this.retroBoardSubscriptions.subscribe(snapshot => {
      this.retroBoards = [];
      snapshot.forEach(doc => {
        const retroBoard = doc.payload.doc.data() as RetroBoard;
        retroBoard.id = doc.payload.doc.id;

        this.retroBoards.push(retroBoard);
      });
    });
  }

}
