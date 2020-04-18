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

  ngOnInit() {
    this.prepareActions();
  }

  public prepareActions() {
    this.dataRetroBoardCards.forEach(retroBoardCard => {
      const actions = new Array<RetroBoardCardActions>();
      retroBoardCard.actions.forEach(action => {
        action.get().then(actionSnapshot => {
          const retroBoardCardAction = actionSnapshot.data() as RetroBoardCardActions;
          const docId = actionSnapshot.id;
          retroBoardCardAction.id = docId;
          actions.push(retroBoardCardAction);
        });
      });
      retroBoardCard.actions = actions;
    });
  }
}
