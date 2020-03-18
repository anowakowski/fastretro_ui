import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { Teams } from 'src/app/models/teams';

const RETRO_BOARD_COLLECTION = '/retroBoards';

@Injectable({
  providedIn: 'root'
})
export class FirestoreRetroBoardService {

  constructor(private firestoreBase: FirestoreBaseService) { }

  addNewRetroBoard(newRetroBoard) {
    const retroBoardToSave = this.prepareRetroBoard(newRetroBoard);
    this.firestoreBase.addNewItem(RETRO_BOARD_COLLECTION, retroBoardToSave);
  }

  private prepareTeam(team: Teams) {
    return this.firestoreBase.addAsRef('/teams/', team.id);
  }

  getTeams() {
    return this.firestoreBase.getAll('/teams/');
  }

  retroBoardSnapshotChanges() {
    return this.firestoreBase.snapshotChanges(RETRO_BOARD_COLLECTION);
  }

  private prepareRetroBoard(newRetroBoard: any) {
    return {
      sprintName: newRetroBoard.sprintName,
      retroName: newRetroBoard.retroName,
      team: this.prepareTeam(newRetroBoard.team),
      members: newRetroBoard.members
    };
  }
}
