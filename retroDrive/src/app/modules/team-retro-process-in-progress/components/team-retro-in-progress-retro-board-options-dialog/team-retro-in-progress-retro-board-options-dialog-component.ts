import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CurrentUsersInRetroBoard } from 'src/app/models/currentUsersInRetroBoard';
import { CurrentUserInRetroBoardDataToDisplay } from 'src/app/models/CurrentUserInRetroBoardDataToDisplay';

@Component({
  selector: 'app-team-retro-in-progress-retro-board-options-dialog-component',
  templateUrl: './team-retro-in-progress-retro-board-options-dialog-component.html',
  styleUrls: ['./team-retro-in-progress-retro-board-options-dialog-component.css']
})

export class TeamRetroInProgressRetroBoardOptionsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressRetroBoardOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataCurrentUsersInRetroBoard: any) { }

  ngOnInit() {
  }

  closeClick(): void {
    this.dialogRef.close();
  }
}
