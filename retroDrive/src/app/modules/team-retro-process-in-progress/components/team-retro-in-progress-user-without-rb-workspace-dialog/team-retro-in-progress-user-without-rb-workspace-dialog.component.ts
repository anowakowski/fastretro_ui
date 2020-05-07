import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-team-retro-in-progress-user-without-rb-workspace-dialog',
  templateUrl: './team-retro-in-progress-user-without-rb-workspace-dialog.component.html',
  styleUrls: ['./team-retro-in-progress-user-without-rb-workspace-dialog.component.css']
})
export class TeamRetroInProgressUserWithoutRbWorkspaceDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamRetroInProgressUserWithoutRbWorkspaceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataName: string) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
