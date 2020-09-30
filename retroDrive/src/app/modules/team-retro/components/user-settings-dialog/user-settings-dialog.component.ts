import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';

import { User } from 'src/app/models/user';
import { Avatar } from 'src/app/models/avatar';
import { BackgroundImage } from 'src/app/models/backgroundImage';
import { UserSettings } from 'src/app/models/UserSettings';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';

@Component({
  selector: 'app-user-settings-dialog',
  templateUrl: './user-settings-dialog.component.html',
  styleUrls: ['./user-settings-dialog.component.css']
})
export class UserSettingsDialogComponent implements OnInit {

  currentUser: User;

  backgroundImages: Array<BackgroundImage>;
  chosenBackgroundImage: BackgroundImage;

  constructor(
    public dialogRef: MatDialogRef<UserSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserInRetroBoardApiService: CurrentUserApiService) {}

  ngOnInit() {
    this.backgroundImages = [
      {name: 'backgroundImage1', isChosen: false, id: 1, photoUrl: null},
      {name: 'backgroundImage2', isChosen: false, id: 2, photoUrl: null},
      {name: 'backgroundImage3', isChosen: false, id: 3, photoUrl: null},
      {name: 'backgroundImage4', isChosen: false, id: 3, photoUrl: null},
      {name: 'backgroundImage5', isChosen: false, id: 3, photoUrl: null}
    ];
    this.currentUser = this.data.currentUser;
    this.currentUserInRetroBoardApiService.getUserSettings(this.currentUser.uid)
      .then(response => {
        const userSettingsFromApi = response;
        this.chosenBackgroundImage = this.backgroundImages.find(avatar => avatar.name === userSettingsFromApi.chosenImageBackgroundName);
        this.chosenBackgroundImage.isChosen = true;
        this.updateAvatarWhenSelected(this.chosenBackgroundImage);
      });
  }

  onSelectBackgroundImage(currentBackgroundImage: BackgroundImage) {

    const findedChosenAvatar = this.backgroundImages.find(avat => avat.isChosen);
    if (findedChosenAvatar !== undefined) {
      findedChosenAvatar.isChosen = false;
      this.updateAvatarWhenSelected(findedChosenAvatar);
    }

    currentBackgroundImage.isChosen = true;
    this.updateAvatarWhenSelected(currentBackgroundImage);
    this.setChosenBackgroundImage();
  }

  onSaveSettings() {
    const chosenBackgroundName = this.backgroundImages.find(bi => bi.isChosen).name;
    const userSettings: UserSettings = {
      userFirebaseDocId: this.data.currentUser.uid,
      chosenImageBackgroundName: chosenBackgroundName
    };
  }

  private updateAvatarWhenSelected(backgroundImage: BackgroundImage) {
    const index = this.getArrayIndex(backgroundImage);
    this.updateBackgroundImage(index, backgroundImage);
  }

  private updateBackgroundImage(index: number, backgroundImageToUpdate: BackgroundImage) {
    this.backgroundImages[index] = backgroundImageToUpdate;
  }

  private getArrayIndex(findedBackgroundImage: BackgroundImage) {
    return this.backgroundImages.indexOf(findedBackgroundImage);
  }

  setChosenBackgroundImage() {
    this.chosenBackgroundImage = this.backgroundImages.find(avatar => avatar.isChosen);
  }

  onNoClick(): void {
    this.dialogRef.close({shouldRefreshTeams: false});
  }
}
