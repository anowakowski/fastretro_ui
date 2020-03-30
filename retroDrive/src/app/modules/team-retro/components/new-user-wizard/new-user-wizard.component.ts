import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { Avatar } from 'src/app/models/avatar';
import { MatStepper } from '@angular/material/stepper';
import { retryWhen } from 'rxjs/operators';

@Component({
  selector: 'app-new-user-wizard',
  templateUrl: './new-user-wizard.component.html',
  styleUrls: ['./new-user-wizard.component.css']
})
export class NewUserWizardComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  isLinear = true;

  workspaceFormGroup: FormGroup;
  workspaceNameFormControl = new FormControl('', Validators.required);

  avatarsFormGroup: FormGroup;
  avatarsNameFormControl = new FormControl('', Validators.required);

  avatars: Array<Avatar>;

  checked = false;
  currentUser: User;

  isNewWorkspace = false;
  isWorkspaceWithRequiredAccess = false;

  chosenAvatarUrl: string;
  isAvatarFromRandomChosen: boolean;

  chosenDisplayName: string;
  chosenWorkspace: string;

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

    this.createFormsBuild();

    this.avatarsNameFormControl.setValue(this.currentUser.splayName);
    this.setRandomAvatar();
  }

  private setRandomAvatar() {
    const randomNumber = Math.floor(Math.random() * (6 - 1)) + 1;
    const randomAvatar = this.avatars.find(avatar => avatar.id === randomNumber);
    this.chosenAvatarUrl = randomAvatar.avatarUrl;
    this.isAvatarFromRandomChosen = true;
  }

  onChangeIsExistingWorkspaceCheckbox(event) {
    this.isNewWorkspace = event.checked;
  }

  onChangeIsWorkspaceWithRequiredAccess(event) {
    this.isWorkspaceWithRequiredAccess = event.checked;
  }

  onSelectAvatar(currentAvatar: Avatar) {
    const findedChosenAvatar = this.avatars.find(avat => avat.isChosen);
    if (findedChosenAvatar !== undefined) {
      if (currentAvatar.id === findedChosenAvatar.id) {
        currentAvatar.isChosen = false;
        this.setRandomAvatar();
      } else {
        findedChosenAvatar.isChosen = false;
        currentAvatar.isChosen = true;
        this.updateAvatarWhenSelected(findedChosenAvatar);
        this.isAvatarFromRandomChosen = false;
      }
    } else {
      currentAvatar.isChosen = true;
      this.isAvatarFromRandomChosen = false;
    }
    this.updateAvatarWhenSelected(currentAvatar);
    this.setChosenAvatar();
  }

  setChosenAvatar() {
    if (!this.isAvatarFromRandomChosen) {
      this.chosenAvatarUrl = this.avatars.find(avatar => avatar.isChosen).avatarUrl;
    }
  }

  getChosenWorskpace() {
    return this.workspaceFormGroup.value.workspaceNameFormControl;
  }

  getChosenName() {
    return this.avatarsFormGroup.value.avatarsNameFormControl;
  }

  getPlaceholderForWorkspaceName() {
    if (this.isNewWorkspace) {
      return 'Put the New Worksapce name';
    } else {
      return 'Put the Existing Worksapce name';
    }
  }

  getValueForWorkspaceLabelInSummaryStep() {
    if (this.isNewWorkspace) {
      return 'Your New Wrokspace Name: ';
    } else {
      return 'The Name of the Workspaces you will join: ';
    }
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

  private createFormsBuild() {
    this.workspaceFormGroup = this.formBuilder.group({
      workspaceNameFormControl: this.workspaceNameFormControl
    });
    this.avatarsFormGroup = this.formBuilder.group({
      avatarsNameFormControl: this.avatarsNameFormControl
    });
  }
}
