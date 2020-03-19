import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { Teams } from 'src/app/models/teams';
import { ConditionQueryData } from 'src/app/helpers/conditionQueryData';

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

  retroBoardFilteredSnapshotChanges() {
    const condition: ConditionQueryData = {
      fieldName: '',
      conditionOperator: '==',
      value: ''
    };
    return this.firestoreBase.getFilteredSnapshotChanges(RETRO_BOARD_COLLECTION, condition);
  }

  private prepareRetroBoard(newRetroBoard: any) {
    return {
      sprintNumber: newRetroBoard.sprintNumber,
      retroName: newRetroBoard.retroName,
      team: this.prepareTeam(newRetroBoard.team),
      members: newRetroBoard.members,
      creationDate: newRetroBoard.creationDate
    };
  }
}
