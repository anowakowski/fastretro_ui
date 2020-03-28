import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { Avatar } from 'src/app/models/avatar';

@Component({
  selector: 'app-new-user-wizard',
  templateUrl: './new-user-wizard.component.html',
  styleUrls: ['./new-user-wizard.component.css']
})
export class NewUserWizardComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thrFormGroup: FormGroup;

  avatars: Array<Avatar>;

  avatar1MainPhotoUrl = 'https://robohash.org/PC1.png?set=set2';
  avatar2MainPhotoUrl = 'https://robohash.org/PC2.png?set=set2';
  avatar3MainPhotoUrl = 'https://robohash.org/PC3.png?set=set2';
  avatar4MainPhotoUrl = 'https://robohash.org/PC4.png?set=set2';
  avatar5MainPhotoUrl = 'https://robohash.org/PC5.png?set=set2';

  checked = false;
  currentUser: User;

  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');

    this.avatars = [
      {avatarUrl: 'https://robohash.org/PC1.png?set=set2', isChosen: false, id: 1},
      {avatarUrl: 'https://robohash.org/PC2.png?set=set2', isChosen: false, id: 2},
      {avatarUrl: 'https://robohash.org/PC3.png?set=set2', isChosen: false, id: 3},
      {avatarUrl: 'https://robohash.org/PC4.png?set=set2', isChosen: false, id: 4},
      {avatarUrl: 'https://robohash.org/PC5.png?set=set2', isChosen: false, id: 5},
      {avatarUrl: this.currentUser.photoURL, isChosen: false, id: 6}
    ];

    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thrFormGroup = this.formBuilder.group({
      thrCtrl: ['', Validators.required]
    });
  }

  onSelectAvatar(currentAvatar: Avatar) {
    const findedChosenAvatar = this.avatars.find(avat => avat.isChosen);

    if (findedChosenAvatar !== undefined) {
      if (currentAvatar.id === findedChosenAvatar.id) {
        currentAvatar.isChosen = false;
      } else {
        findedChosenAvatar.isChosen = false;
        currentAvatar.isChosen = true;
        this.updateAvatarWhenSelected(findedChosenAvatar);
      }
    } else {
      currentAvatar.isChosen = true;
    }
    this.updateAvatarWhenSelected(currentAvatar);
  }

  private updateAvatarWhenSelected(avatar: Avatar) {
    const index = this.getArrayIndex(avatar);
    this.updaAvatar(index, avatar);
  }

  private getArrayIndex(findedAvatar: Avatar) {
    return this.avatars.indexOf(findedAvatar);
  }

  private updaAvatar(index: number, avatarToUpdate: Avatar) {
    this.avatars[index] = avatarToUpdate;
  }


}
