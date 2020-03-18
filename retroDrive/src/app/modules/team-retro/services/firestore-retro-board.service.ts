import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { Teams } from 'src/app/models/teams';

@Injectable({
  providedIn: 'root'
})
export class FirestoreRetroBoardService {

  private colName = '/retroBoards';
  constructor(private firestoreBase: FirestoreBaseService) { }

  addNewRetroBoard(newRetroBoard) {

    const retroBoardToSave = {
      sprintName: newRetroBoard.sprintName,
      retroName: newRetroBoard.retroName,
      team: this.prepareTeam(newRetroBoard.team),
      members: newRetroBoard.members
    };

    this.firestoreBase.addNewItem(this.colName, retroBoardToSave);
  }

  prepareTeam(team: Teams) {
    return this.firestoreBase.addAsRef('/teams', team.id);
  }

  getTeams() {
    return this.firestoreBase.getAll('/teams');
  }
}
