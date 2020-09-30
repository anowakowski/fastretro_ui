import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';

import { User } from 'src/app/models/user';
import { Avatar } from 'src/app/models/avatar';

@Component({
  selector: 'app-user-settings-dialog',
  templateUrl: './user-settings-dialog.component.html',
  styleUrls: ['./user-settings-dialog.component.css']
})
export class UserSettingsDialogComponent implements OnInit {

  currentUser: User;
  
  avatars: Array<Avatar>;

  constructor(
    public dialogRef: MatDialogRef<UserSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService) {}

  ngOnInit() {
    this.currentUser = this.data.currentUser;

    this.avatars = [
      {avatarName: 'avatar1', isChosen: false, id: 1, photoUrl: null, isSocialMediaAvatar: false},
      {avatarName: 'avatar2', isChosen: false, id: 2, photoUrl: null, isSocialMediaAvatar: false},
      {avatarName: 'avatar3', isChosen: false, id: 3, photoUrl: null, isSocialMediaAvatar: false}
    ];
  }

  onNoClick(): void {
    this.dialogRef.close({shouldRefreshTeams: false});
  }
}
