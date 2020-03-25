import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/models/dialogData';

@Component({
  selector: 'app-team-retro-in-progress-set-time-dialog',
  templateUrl: './team-retro-in-progress-set-time-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-set-time-dialog.component.css']
})
export class TeamRetroInProgressSetTimeDialogComponent implements OnInit {



  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressSetTimeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  foods: TimerOption[] = [
    { value: '1', viewValue: '3 min' },
    { value: '2', viewValue: '5 min' },
    { value: '3', viewValue: '7 min' },
    { value: '4', viewValue: '10 min' },
    { value: '5', viewValue: '13 min' },
    { value: '6', viewValue: '15 min' },
    { value: '7', viewValue: '20 min' },
  ];

  ngOnInit() {
  }



  onNoClick(): void {
    this.dialogRef.close();
  }

  getValueToPass() {
    return this.data.value;
  }

}

export class TimerOption {
  public value: any;
  public viewValue: any;
}