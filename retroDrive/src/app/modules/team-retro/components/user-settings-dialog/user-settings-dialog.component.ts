import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';

import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-settings-dialog',
  templateUrl: './user-settings-dialog.component.html',
  styleUrls: ['./user-settings-dialog.component.css']
})
export class UserSettingsDialogComponent implements OnInit {

  currentUser: User;

  constructor(
    public dialogRef: MatDialogRef<UserSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService) {}

  ngOnInit() {
    this.currentUser = this.data.currentUser;
  }

  onNoClick(): void {
    this.dialogRef.close({shouldRefreshTeams: false});
  }
}
