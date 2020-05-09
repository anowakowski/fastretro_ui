import { Injectable } from '@angular/core';
import { FirestoreBaseService } from 'src/app/services/firestore-base.service';
import { ConditionQueryData } from 'src/app/helpers/conditionQueryData';
import { TimerOption } from 'src/app/models/timerOption';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { CurrentUsersInRetroBoardToSave } from 'src/app/models/currentUsersInRetroBoardToSave';

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
    this.firestoreBase.deleteItem('/retroBoardCardActions/', actionId);
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

  findRetroBoardByUrlParamIdSnapshotChanges(urlParamId: string) {
    const condition: ConditionQueryData = {
      fieldName: 'urlParamId',
      conditionOperator: '==',
      value: urlParamId
    };

    return this.firestoreBase.getFilteredSnapshotChanges('/retroBoards/', condition);
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

  findRetroBoardByIdSnapshotChanges(id: string) {
    return this.firestoreBase.getFilteredByIdSnapshotChanges('retroBoards', id);
  }

  removeRetroBoardCard(id: string) {
    this.firestoreBase.deleteItem('/retroBoardCards/', id);
  }
}
