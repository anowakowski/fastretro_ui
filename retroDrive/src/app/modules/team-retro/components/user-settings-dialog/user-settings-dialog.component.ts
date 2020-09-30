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
  chosenAvatar: Avatar;

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

  onSelectAvatar(currentAvatar: Avatar) {

    const findedChosenAvatar = this.avatars.find(avat => avat.isChosen);
    if (findedChosenAvatar !== undefined) {
      findedChosenAvatar.isChosen = false;
      this.updateAvatarWhenSelected(findedChosenAvatar);
    }


    currentAvatar.isChosen = true;
    this.updateAvatarWhenSelected(currentAvatar);
    this.setChosenAvatar();
  }

  private updateAvatarWhenSelected(avatar: Avatar) {
    const index = this.getArrayIndex(avatar);
    this.updaAvatar(index, avatar);
  }

  private updaAvatar(index: number, avatarToUpdate: Avatar) {
    this.avatars[index] = avatarToUpdate;
  }

  private getArrayIndex(findedAvatar: Avatar) {
    return this.avatars.indexOf(findedAvatar);
  }

  setChosenAvatar() {
    this.chosenAvatar = this.avatars.find(avatar => avatar.isChosen);
  }

  onNoClick(): void {
    this.dialogRef.close({shouldRefreshTeams: false});
  }
}
