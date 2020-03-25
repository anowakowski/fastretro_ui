import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData } from 'src/app/models/dialogData';

@Component({
  selector: 'app-team-retro-in-progress-set-time-dialog',
  templateUrl: './team-retro-in-progress-set-time-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-set-time-dialog.component.css']
})
export class TeamRetroInProgressSetTimeDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressSetTimeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}