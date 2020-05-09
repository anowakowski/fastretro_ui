import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TimerOption } from 'src/app/models/timerOption';

@Component({
  selector: 'app-team-retro-in-progress-set-time-dialog',
  templateUrl: './team-retro-in-progress-show-all-users-in-current-retro-dialog.html',
  styleUrls: ['./team-retro-in-progress-show-all-users-in-current-retro-dialog.css']
})

export class TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressShowAllUsersInCurrentRetroDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataTimerOptions: TimerOption[]) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
