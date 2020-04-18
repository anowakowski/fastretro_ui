import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';

@Component({
  selector: 'app-team-retro-in-progress-show-action-dialog',
  templateUrl: './team-retro-in-progress-show-action-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-action-dialog.component.css']
})
export class TeamRetroInProgressShowActionDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataRetroBoardCard: RetroBoardCard,
    private firestoreService: FiresrtoreRetroProcessInProgressService) { }

  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  actions: any[];

  ngOnInit() {
    this.prepareActions();
  }



  private prepareActions() {
    this.actions = new Array<any>();
    this.dataRetroBoardCard.actions.forEach(action => {
      action.get().then(actionSnapshot => {
        const actionText = actionSnapshot.data().text;
        const actionId = actionSnapshot.id;
        // tslint:disable-next-line:object-literal-shorthand
        this.actions.push({ actionText: actionText, actionId: actionId });
      });
    });
  }
}
