import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { RetroBoardCardActions } from 'src/app/models/retroBoardCardActions';

@Component({
  selector: 'app-team-retro-in-progress-show-all-actions-dialog',
  templateUrl: './team-retro-in-progress-show-all-actions-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-all-actions-dialog.component.css']
})
export class TeamRetroInProgressShowAllActionsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowAllActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataRetroBoardCards: RetroBoardCard[]
  ) { }

  simpleRetroBoardCards: any[];

  ngOnInit() {
    this.prepareSimpleCartAndActionsActions();
  }

  public prepareSimpleCartAndActionsActions() {
    this.simpleRetroBoardCards = new Array<any>();
    this.dataRetroBoardCards.forEach(dataRetroBoardCard => {
      const simpleCardToAdd: any = {};
      simpleCardToAdd.name = dataRetroBoardCard.name;
      simpleCardToAdd.actions = new Array<RetroBoardCardActions>();
      dataRetroBoardCard.actions.forEach(action => {
        action.get().then(actionSnapshot => {
          const retroBoardCardAction = actionSnapshot.data() as RetroBoardCardActions;
          const docId = actionSnapshot.id;
          retroBoardCardAction.isEdit = false;
          retroBoardCardAction.id = docId;
          simpleCardToAdd.actions.push(retroBoardCardAction);
        });
      });
      this.simpleRetroBoardCards.push(simpleCardToAdd);
    });
  }
}
