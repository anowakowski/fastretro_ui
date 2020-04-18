import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';

@Component({
  selector: 'app-team-retro-in-progress-show-action-dialog',
  templateUrl: './team-retro-in-progress-show-action-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-show-action-dialog.component.css']
})
export class TeamRetroInProgressShowActionDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataRetroBoardCard: RetroBoardCard) { }

  ngOnInit() {
    console.log(this.dataRetroBoardCard);
  }


}
