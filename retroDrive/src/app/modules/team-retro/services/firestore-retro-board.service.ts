import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { Teams } from 'src/app/models/teams';
import { ConditionQueryData } from 'src/app/helpers/conditionQueryData';
import { RetroBoardToSave } from 'src/app/models/retroBoardToSave';
import { User } from 'src/app/models/user';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { CurrentUsersInRetroBoardToSave } from 'src/app/models/currentUsersInRetroBoardToSave';

const RETRO_BOARD_COLLECTION = '/retroBoards';

@Injectable({
  providedIn: 'root'
})
export class FirestoreRetroBoardService {

  constructor(private firestoreBase: FirestoreBaseService) { }

  addNewRetroBoard(newRetroBoard) {
    const retroBoardToSave = this.prepareRetroBoardToSave(newRetroBoard);
    return this.firestoreBase.addNewItem(RETRO_BOARD_COLLECTION, retroBoardToSave);
  }

  addNewTeam(teamToSave: any) {
    return this.firestoreBase.addNewItem('/teams/', teamToSave);
  }

  addNewUserTeams(userTeamsToSave: UserTeamsToSave) {
    this.firestoreBase.addNewItem('/userTeams/', userTeamsToSave);
  }

  addToCurrentUserInRetroBoard(currentUserInRetroBoard: CurrentUsersInRetroBoardToSave) {
    this.firestoreBase.addNewItem('/currentUserInRetroBoard/', currentUserInRetroBoard);
  }

  updateUserTeams(exisitngUserTeamToUpdate: any, id: string) {
    this.firestoreBase.updateItem('/userTeams/', id, exisitngUserTeamToUpdate);
  }

  updateRetroBoard(retroBoardToUpdate: any, id: any) {
    this.firestoreBase.updateItem('/retroBoards/', id, retroBoardToUpdate);
  }

  updateUserWorkspaces(findedUserWorkspace: UserWorkspaceToSave, userWorkspaceId: string) {
    this.firestoreBase.updateItem('/userworkspaces/', userWorkspaceId, findedUserWorkspace);
  }

  prepareTeam(team: Teams) {
    return this.firestoreBase.addAsRef('/teams/', team.id);
  }

  getTeams() {
    return this.firestoreBase.getAll('/teams/');
  }

  getTeamsFiltered(workspaceId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'workspaceId',
      conditionOperator: '==',
      value: workspaceId
    };

    return this.firestoreBase.getFiltered('/teams/', condition);
  }

  getUserTeams(uid: string) {
    const condition: ConditionQueryData = {
      fieldName: 'userId',
      conditionOperator: '==',
      value: uid
    };

    return this.firestoreBase.getFiltered('/userTeams/', condition);
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

  retroBoardFilteredByWorkspaceIdSnapshotChanges(workspaceId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'workspaceId',
      conditionOperator: '==',
      value: workspaceId
    };

    return this.firestoreBase.getFilteredSnapshotChanges('/retroBoards/', condition);
  }

  retroBoardCardActionsFilteredByRetroBoardId(retroBoardId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'retroBoardId',
      conditionOperator: '==',
      value: retroBoardId
    };

    return this.firestoreBase.getFiltered('/retroBoardCardActions/', condition);
  }


  deleteRetroBoard(retroBoard: RetroBoardToSave) {
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

  findFilteredRetroBoardCardActions() {

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

  addTeamAsRef(teamId: string) {
    return this.firestoreBase.addAsRef('/teams/', teamId);
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

  findUserTeamsSnapshotChanges(userId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'userId',
      conditionOperator: '==',
      value: userId
    };

    return this.firestoreBase.getFilteredSnapshotChanges('/userTeams/', condition);
  }

  findUserWorkspacesById(id: string) {
    return this.firestoreBase.getFilteredById('/userworkspaces/', id);
  }

  findUserTeams(userId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'userId',
      conditionOperator: '==',
      value: userId
    };

    return this.firestoreBase.getFiltered('/userTeams/', condition);
  }

  findTeamsInCurrentWorkspace(workspaceId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'workspaceId',
      conditionOperator: '==',
      value: workspaceId
    };

    return this.firestoreBase.getFiltered('/teams/', condition);
  }

  private prepareRetroBoardToSave(newRetroBoard: any) {
    return {
      sprintNumber: newRetroBoard.sprintNumber,
      retroName: newRetroBoard.retroName,
      team: this.prepareTeam(newRetroBoard.team),
      // members: newRetroBoard.members,
      creationDate: newRetroBoard.creationDate,
      lastModifiedDate: newRetroBoard.lastModifiedDate,
      isFinished: newRetroBoard.isFinished,
      isStarted: false,
      urlParamId: newRetroBoard.urlParamId,
      workspaceId: newRetroBoard.workspaceId
    };
  }
}
