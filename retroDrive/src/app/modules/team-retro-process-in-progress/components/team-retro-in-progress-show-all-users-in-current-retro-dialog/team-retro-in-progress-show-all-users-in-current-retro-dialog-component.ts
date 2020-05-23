import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CurrentUsersInRetroBoard } from 'src/app/models/currentUsersInRetroBoard';

@Component({
  selector: 'app-team-retro-in-progress-show-all-users-in-current-retro-dialog-component',
  templateUrl: './team-retro-in-progress-show-all-users-in-current-retro-dialog-component.html',
  styleUrls: ['./team-retro-in-progress-show-all-users-in-current-retro-dialog-component.css']
})

export class TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataCurrentUsersInRetroBoard: CurrentUsersInRetroBoard) { }

  ngOnInit() {
  }

  closeClick(): void {
    this.dialogRef.close();
  }
}
