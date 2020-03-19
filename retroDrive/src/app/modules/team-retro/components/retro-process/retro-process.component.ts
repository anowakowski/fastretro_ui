import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { AddNewRetroBoardBottomsheetComponent } from '../add-new-retro-board-bottomsheet/add-new-retro-board-bottomsheet.component';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { RetroBoard } from 'src/app/models/retroBoard';
import { Teams } from 'src/app/models/teams';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RetroBoardSnackbarComponent } from '../retro-board-snackbar/retro-board-snackbar.component';

@Component({
  selector: 'app-retro-process',
  templateUrl: './retro-process.component.html',
  styleUrls: ['./retro-process.component.css']
})
export class RetroProcessComponent implements OnInit {

  retroBoards: RetroBoard[];
  retroBoardSubscriptions: any;

  constructor(private bottomSheetRef: MatBottomSheet, private frbs: FirestoreRetroBoardService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.prepareRetroBoard();
  }

  openBottomSheet(): void {
    const bottomSheetRef = this.bottomSheetRef.open(AddNewRetroBoardBottomsheetComponent);

    bottomSheetRef.afterDismissed().subscribe(() => {
      console.log('Bottom sheet has been dismissed.');
    });
  }

  deleteRetroBoard(retroBoard: RetroBoard) {
    this.frbs.deleteRetroBoard(retroBoard);
    this.openSnackBarForDelete(retroBoard.retroName);
  }

  openSnackBarForDelete(retroBoardName) {
    const durationInSeconds = 3;
    this.snackBar.openFromComponent(RetroBoardSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        displayText: 'deleted Retro Board: ' + retroBoardName
      }
    });
  }

  private prepareRetroBoard() {
    this.retroBoardSubscriptions = this.frbs.retroBoardFilteredSnapshotChanges().subscribe(snapshot => {
      this.retroBoards = [];
      this.CreateBaseRetroBoardData(snapshot);
    });
  }

  private CreateBaseRetroBoardData(snapshot: any) {
    snapshot.forEach(retroBoardSnapshot => {
      const retroBoard = retroBoardSnapshot.payload.doc.data() as RetroBoard;
      retroBoard.id = retroBoardSnapshot.payload.doc.id;
      const team = retroBoardSnapshot.payload.doc.data().team.get();
      this.prepareTeams(team, retroBoard);
    });
  }

  private prepareTeams(team: any, retroBoard: RetroBoard) {
    team.then(teamSnap => {
      const teamToAdd = teamSnap.data() as Teams;
      retroBoard.team = teamToAdd;
      this.addToRetroBoards(retroBoard);
    });
  }

  private addToRetroBoards(retroBoard: RetroBoard) {
    this.retroBoards.push(retroBoard);
  }
}
