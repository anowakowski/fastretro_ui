import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-join-to-existing-team-dialog',
  templateUrl: './join-to-existing-team-dialog.component.html',
  styleUrls: ['./join-to-existing-team-dialog.component.css']
})
export class JoinToExistingTeamDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<JoinToExistingTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
