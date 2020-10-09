import { Injectable } from '@angular/core';
import { ConditionQueryData } from 'src/app/helpers/conditionQueryData';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';

@Injectable({
  providedIn: 'root'
})
export class AllRetroBoardListDataSerivceService {

  constructor(private firestoreRBServices: FirestoreRetroBoardService) { }

  getRetroBoardSnapshotChangesForBatch(
    workspaceId: string,
    batchSize,
    lastSeen,
    filters) {

    if (filters.some(f => f.value === true)) {
      if (this.checkIfFilterExist(filters, 'shouldShowOnlyFinished')) {
        const additionalCondition: ConditionQueryData = {
          fieldName: 'isFinished',
          conditionOperator: '==',
          value: true
        };

        return this.firestoreRBServices.retroBoardFilteredByWorkspaceIdAndIsFinishedFiltersSnapshotChangesForBatch(
          workspaceId, batchSize, lastSeen, additionalCondition);
      } else if (this.checkIfFilterExist(filters, 'shouldShowOnlyOpened')) {
        const additionalCondition: ConditionQueryData = {
          fieldName: 'isFinished',
          conditionOperator: '==',
          value: false
        };

        return this.firestoreRBServices.retroBoardFilteredByWorkspaceIdAndIsFinishedFiltersSnapshotChangesForBatch(
          workspaceId, batchSize, lastSeen, additionalCondition);
      }
    }
    return this.firestoreRBServices.retroBoardFilteredByWorkspaceIdSnapshotChangesForBatch(workspaceId, batchSize, lastSeen);
  }

  private checkIfFilterExist(filters: any, filterName: string) {
    return filters.some(f => f.name === filterName && f.value);
  }
}
