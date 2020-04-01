import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-welcome-info-new-users-dashboard-dialog',
  templateUrl: './welcome-info-new-users-dashboard-dialog.component.html',
  styleUrls: ['./welcome-info-new-users-dashboard-dialog.component.css']
})
export class WelcomeInfoNewUsersDashboardDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<WelcomeInfoNewUsersDashboardDialogComponent>) { }

  ngOnInit() {
  }

  onApproveClick(): void {
    this.dialogRef.close();
  }

}
