import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { ConditionQueryData } from 'src/app/helpers/conditionQueryData';
import { TimerOption } from 'src/app/models/timerOption';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { CurrentUsersInRetroBoardToSave } from 'src/app/models/currentUsersInRetroBoardToSave';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';

@Injectable({
  providedIn: 'root'
})
export class FiresrtoreRetroProcessInProgressService {

  constructor(private firestoreBase: FirestoreBaseService) { }

  addNewRetroBoardCard(newRetroBoardCard) {
    return this.firestoreBase.addNewItem('/retroBoardCards/', newRetroBoardCard);
  }

  addNewRetroBoardCardAction(newRetroBoardCardAction) {
    return this.firestoreBase.addNewItem('/retroBoardCardActions/', newRetroBoardCardAction);
  }

  addNewTimerOptions(timerOption: TimerOption) {
    this.firestoreBase.addNewItem('/timerOptions/', timerOption);
  }

  addNewTimerSettingForRetroBoard(timerSetting: any) {
    return this.firestoreBase.addNewItem('/timerSettings/', timerSetting);
  }

  addNewUserWorkspace(userWorkspace: UserWorkspaceToSave) {
    this.firestoreBase.addNewItem('/userworkspaces', userWorkspace);
  }

  addNewUserTeams(userTeamsToSave: UserTeamsToSave) {
    this.firestoreBase.addNewItem('/userTeams/', userTeamsToSave);
  }

  updateRetroBoardCardAction(action: any, id: string) {
    this.firestoreBase.updateItem('/retroBoardCardActions/', id, action);
  }

  updateCurrentTimerSettings(timerSettingToUpdate: any, timerSettingId: string) {
    this.firestoreBase.updateItem('/timerSettings/', timerSettingId, timerSettingToUpdate);
  }

  updateUserWorkspaces(findedUserWorkspace: UserWorkspaceToSave, userWorkspaceId: string) {
    this.firestoreBase.updateItem('/userworkspaces/', userWorkspaceId, findedUserWorkspace);
  }

  updateUserTeams(exisitngUserTeamToUpdate: any, id: string) {
    this.firestoreBase.updateItem('/userTeams/', id, exisitngUserTeamToUpdate);
  }

  updateCurrentUserInRetroBoard(findedCurrentUserInRetroBoard: CurrentUsersInRetroBoardToSave, docId) {
    this.firestoreBase.updateItem('/currentUserInRetroBoard/', docId, findedCurrentUserInRetroBoard);
  }

  deleteRetroBoardCardAction(actionId) {
    return this.firestoreBase.deleteItem('/retroBoardCardActions/', actionId);
  }

  removeCurrentUserToRetroBoard(id: string) {
    this.firestoreBase.deleteItem('/currentUserInRetroBoard/', id);
  }


  updateRetroBoardCard(cardToUpdate: any, id: string) {
    this.firestoreBase.updateItem('/retroBoardCards/', id, cardToUpdate);
  }

  findRetroBoardByUrlParamId(urlParamId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'urlParamId',
      conditionOperator: '==',
      value: urlParamId
    };

    return this.firestoreBase.getFiltered('/retroBoards/', condition);
  }

  getUserTeams(uid: string) {
    const condition: ConditionQueryData = {
      fieldName: 'userId',
      conditionOperator: '==',
      value: uid
    };

    return this.firestoreBase.getFiltered('/userTeams/', condition);
  }

  getCurrentUserInRetroBoard(id: string) {
    const condition: ConditionQueryData = {
      fieldName: 'retroBoardId',
      conditionOperator: '==',
      value: id
    };

    return this.firestoreBase.getFiltered('/currentUserInRetroBoard/', condition);
  }

  getUserWorkspace(uid: string) {
    const condition: ConditionQueryData = {
      fieldName: 'userId',
      conditionOperator: '==',
      value: uid
    };

    return this.firestoreBase.getFiltered('/userworkspaces/', condition);
  }

  retroBoardCardActionsFilteredByRetroBoardId(retroBoardId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'retroBoardId',
      conditionOperator: '==',
      value: retroBoardId
    };

    return this.firestoreBase.getFiltered('/retroBoardCardActions/', condition);
  }

  getActionByid(actionId: string) {
    return this.firestoreBase.getFilteredById('/retroBoardCardActions/', actionId);
  }

  findRetroBoardByUrlParamIdSnapshotChanges(urlParamId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'urlParamId',
      conditionOperator: '==',
      value: urlParamId
    };

    return this.firestoreBase.getFilteredSnapshotChanges('/retroBoards/', condition);
  }

  findCurrentUserInRetroBoardIdSnapshotChanges(id: string) {
    const condition: ConditionQueryData = {
      fieldName: 'retroBoardId',
      conditionOperator: '==',
      value: id
    };

    return this.firestoreBase.getFilteredSnapshotChanges('/currentUserInRetroBoard/', condition);
  }

  findCurrentUserVoutes(uid: string) {
    const condition: ConditionQueryData = {
      fieldName: 'userId',
      conditionOperator: '==',
      value: uid
    };

    return this.firestoreBase.getFilteredSnapshotChanges('/usersVotes/', condition);
  }


  findRetroBoardCardById(docId: string) {
    return this.firestoreBase.getFilteredById('/retroBoardCards/', docId);
  }

  findWorkspaceById(docId: string) {
    return this.firestoreBase.getFilteredById('/workspaces/', docId);
  }

  findUserWorkspacesById(id: string) {
    return this.firestoreBase.getFilteredById('/userworkspaces/', id);
  }

  getAllTimerOptions() {
    return this.firestoreBase.getAll('/timerOptions/');
  }

  getFilteredTimerSettingForCurrentRetroBoard(retroBoardId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'retroBoardId',
      conditionOperator: '==',
      value: retroBoardId
    };

    return this.firestoreBase.getFiltered('/timerSettings/', condition);
  }

  getFilteredTimerSettingForCurrentRetroBoardSnapshotChanges(retroBoardId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'retroBoardId',
      conditionOperator: '==',
      value: retroBoardId
    };

    return this.firestoreBase.getFilteredSnapshotChanges('/timerSettings/', condition);
  }

  getFilteredTimerSettingByIdSnapshotChanges(timerSettingId: string) {
    return this.firestoreBase.getFilteredByIdSnapshotChanges('/timerSettings/', timerSettingId);
  }

  getUserById(docId: string) {
    return this.firestoreBase.getFilteredById('users', docId);
  }

  addRetroBoardAsRef(retroBoardId: string) {
    return this.firestoreBase.addAsRef('/retroBoards/', retroBoardId);
  }

  addUserAsRef(uid: string) {
    return this.firestoreBase.addAsRef('/users/', uid);
  }

  addRetroBoardCardActionAsRef(actionId: string) {
    return this.firestoreBase.addAsRef('/retroBoardCardActions/', actionId);
  }

  addWorkspaceAsRef(workspaceId: string) {
    return this.firestoreBase.addAsRef('/workspaces/', workspaceId);
  }

  addTeamAsRef(teamId: string) {
    return this.firestoreBase.addAsRef('/teams/', teamId);
  }

  updateRetroBoard(retroBoardToUpdate: any, id: any) {
    this.firestoreBase.updateItem('/retroBoards/', id, retroBoardToUpdate);
  }

  retroBoardCardsFilteredSnapshotChanges() {
    return this.firestoreBase.snapshotChanges('/retroBoardCards/');
  }

  retroBoardCardsFilteredByRetroBoardIdSnapshotChanges(retroBoardId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'retroBoardId',
      conditionOperator: '==',
      value: retroBoardId
    };

    return this.firestoreBase.getFilteredSnapshotChanges('/retroBoardCards/', condition);
  }

  retroBoardCardsFilteredByRetroBoardId(retroBoardId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'retroBoardId',
      conditionOperator: '==',
      value: retroBoardId
    };

    return this.firestoreBase.getFiltered('/retroBoardCards/', condition);
  }

  findRetroBoardByIdSnapshotChanges(id: string) {
    return this.firestoreBase.getFilteredByIdSnapshotChanges('retroBoards', id);
  }

  findRetroBoardById(id: string) {
    return this.firestoreBase.getFilteredById('retroBoards', id);
  }

  removeRetroBoardCard(id: string) {
    return this.firestoreBase.deleteItem('/retroBoardCards/', id);
  }
}
