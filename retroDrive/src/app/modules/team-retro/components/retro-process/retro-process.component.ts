import { Component, OnInit, OnDestroy } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { AddNewRetroBoardBottomsheetComponent } from '../add-new-retro-board-bottomsheet/add-new-retro-board-bottomsheet.component';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { RetroBoard } from 'src/app/models/retroBoard';
import { Teams } from 'src/app/models/teams';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RetroBoardSnackbarComponent } from '../retro-board-snackbar/retro-board-snackbar.component';
import { DataPassingService } from 'src/app/services/data-passing.service';
import { Router } from '@angular/router';
import { Team } from 'src/app/models/team';

@Component({
  selector: 'app-retro-process',
  templateUrl: './retro-process.component.html',
  styleUrls: ['./retro-process.component.css']
})
export class RetroProcessComponent implements OnInit, OnDestroy {

  retroBoards: RetroBoard[];
  retroBoardSubscriptions: any;

  dataIsLoading = true;

  constructor(
    private bottomSheetRef: MatBottomSheet,
    private frbs: FirestoreRetroBoardService,
    private dataPassingService: DataPassingService,
    private snackBar: MatSnackBar,
    private router: Router) { }

  ngOnDestroy(): void {
    this.retroBoardSubscriptions.unsubscribe();
  }

  ngOnInit() {
    this.prepareRetroBoard();
  }

  openBottomSheet(): void {
    const bottomSheetRef = this.bottomSheetRef.open(AddNewRetroBoardBottomsheetComponent);

    bottomSheetRef.afterDismissed().subscribe(() => {
      console.log('Bottom sheet has been dismissed.');
    });
  }

  shouldShowRetroBoardElements() {
    if (this.retroBoards !== undefined) {
      if (this.retroBoards.length > 0) {
        return true;
      }
    }
    return false;
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

  onStartRetroProcess(retroBoard) {
    const retroBoardToUpdate = {
      isStarted: true
    };

    this.frbs.updateRetroBoard(retroBoardToUpdate, retroBoard.id);

    this.dataPassingService.setData(retroBoard.urlParamId, retroBoard);
    this.router.navigateByUrl('/retro-in-progress/' + retroBoard.urlParamId);
  }

  private prepareRetroBoard() {
    this.retroBoardSubscriptions = this.frbs.retroBoardFilteredSnapshotChanges().subscribe(snapshot => {
      this.dataIsLoading = true;
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

    if (snapshot.length === 0) {
      this.dataIsLoading = false;
    }
  }

  private prepareTeams(team: any, retroBoard: RetroBoard) {
    team.then(teamSnap => {
      const teamToAdd = teamSnap.data() as Team;
      retroBoard.team = teamToAdd;
      this.addToRetroBoards(retroBoard);
    });
  }

  private addToRetroBoards(retroBoard: RetroBoard) {
    this.retroBoards.push(retroBoard);
    this.dataIsLoading = false;
  }
}
