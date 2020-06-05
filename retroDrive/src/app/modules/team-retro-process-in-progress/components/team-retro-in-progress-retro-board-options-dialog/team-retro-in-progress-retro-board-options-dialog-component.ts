import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CurrentUsersInRetroBoard } from 'src/app/models/currentUsersInRetroBoard';
import { CurrentUserInRetroBoardDataToDisplay } from 'src/app/models/CurrentUserInRetroBoardDataToDisplay';
import { RetroBoard } from 'src/app/models/retroBoard';

@Component({
  selector: 'app-team-retro-in-progress-retro-board-options-dialog-component',
  templateUrl: './team-retro-in-progress-retro-board-options-dialog-component.html',
  styleUrls: ['./team-retro-in-progress-retro-board-options-dialog-component.css']
})

export class TeamRetroInProgressRetroBoardOptionsDialogComponent implements OnInit {

  shouldBlurRetroBoardCard: boolean;
  
  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressRetroBoardOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public retroBoardData: RetroBoard) { }

  ngOnInit() {
  }

  closeClick(): void {
    this.dialogRef.close();
  }
}
