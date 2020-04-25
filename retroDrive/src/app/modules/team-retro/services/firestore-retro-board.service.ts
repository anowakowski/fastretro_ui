import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { Teams } from 'src/app/models/teams';
import { ConditionQueryData } from 'src/app/helpers/conditionQueryData';
import { RetroBoard } from 'src/app/models/retroBoard';
import { User } from 'src/app/models/user';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';

const RETRO_BOARD_COLLECTION = '/retroBoards';

@Injectable({
  providedIn: 'root'
})
export class FirestoreRetroBoardService {

  constructor(private firestoreBase: FirestoreBaseService) { }

  addNewRetroBoard(newRetroBoard) {
    const retroBoardToSave = this.prepareRetroBoardToSave(newRetroBoard);
    this.firestoreBase.addNewItem(RETRO_BOARD_COLLECTION, retroBoardToSave);
  }

  prepareTeam(team: Teams) {
    return this.firestoreBase.addAsRef('/teams/', team.id);
  }

  getTeams() {
    return this.firestoreBase.getAll('/teams/');
  }

  findWorkspacesByName(name: string) {
    const condition: ConditionQueryData = {
      fieldName: 'name',
      conditionOperator: '==',
      value: name
    };

    return this.firestoreBase.getFiltered('/workspaces/', condition);
  }

  retroBoardSnapshotChanges() {
    return this.firestoreBase.snapshotChanges(RETRO_BOARD_COLLECTION);
  }

  retroBoardFilteredSnapshotChanges() {
    const condition: ConditionQueryData = {
      fieldName: 'isStarted',
      conditionOperator: '==',
      value: false
    };
    return this.firestoreBase.getFilteredSnapshotChanges(RETRO_BOARD_COLLECTION, condition);
  }

  deleteRetroBoard(retroBoard: RetroBoard) {
    this.firestoreBase.deleteItem(RETRO_BOARD_COLLECTION, retroBoard.id);
  }

  findUsersByEmail(mail: string) {
    const condition: ConditionQueryData = {
      fieldName: 'email',
      conditionOperator: '==',
      value: mail
    };
    return this.firestoreBase.getFiltered('/users', condition);
  }

  updateUsr(user: User) {
    this.firestoreBase.updateUserData(user);
  }

  addNewWorkspace(workspace: WorkspaceToSave) {
    return this.firestoreBase.addNewItem('/workspaces', workspace);
  }

  addNewUserWorkspace(userWorkspace: UserWorkspaceToSave) {
    this.firestoreBase.addNewItem('/userworkspaces', userWorkspace);
  }

  addUserAsRef(user: User) {
    return this.firestoreBase.addAsRef('/users/', user.uid);
  }

  addWorkspaceAsRef(workspaceId: string) {
    return this.firestoreBase.addAsRef('/workspaces/', workspaceId);
  }


  getUserWorkspace(uid: string) {
    const condition: ConditionQueryData = {
      fieldName: 'userId',
      conditionOperator: '==',
      value: uid
    };

    return this.firestoreBase.getFiltered('/userworkspaces/', condition);
  }

  private prepareRetroBoardToSave(newRetroBoard: any) {
    return {
      sprintNumber: newRetroBoard.sprintNumber,
      retroName: newRetroBoard.retroName,
      team: this.prepareTeam(newRetroBoard.team),
      members: newRetroBoard.members,
      creationDate: newRetroBoard.creationDate,
      isStarted: false,
      urlParamId: newRetroBoard.urlParamId
    };
  }
}
