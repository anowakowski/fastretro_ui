import { Component, OnInit, ViewChild } from '@angular/core';
import {formatDate} from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { Avatar } from 'src/app/models/avatar';
import { MatStepper } from '@angular/material/stepper';
import { retryWhen, find } from 'rxjs/operators';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Workspace } from 'src/app/models/workspace';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';

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

  chosenAvatar: Avatar;
  isAvatarFromRandomChosen: boolean;

  chosenDisplayName: string;
  chosenWorkspace: string;

  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private firestoreRbService: FirestoreRetroBoardService) { }

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
    this.chosenAvatar = randomAvatar;
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
      this.chosenAvatar = this.avatars.find(avatar => avatar.isChosen);
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
      return 'Put The New Worksapce Name';
    } else {
      return 'Put The Existing Worksapce Name';
    }
  }

  getLabelNameForWorkspaceName() {
    if (this.isNewWorkspace) {
      return 'Name of Your New Workspace';
    } else {
      return 'Name of Existing Workspace';
    }
  }

  getValueForWorkspaceLabelInSummaryStep() {
    if (this.isNewWorkspace) {
      return 'Your New Wrokspace Name: ';
    } else {
      return 'The Name of The Workspaces You Will Join: ';
    }
  }

  saveNewConfiguration() {
    const displayName = this.avatarsFormGroup.value.avatarsNameFormControl;
    const chosenAvatar = this.chosenAvatar;

    this.firestoreRbService.findUsersByEmail(this.currentUser.email).then(snapshotFindedUsr => {
      if (snapshotFindedUsr.docs.length > 0) {
        const findedUsr = snapshotFindedUsr.docs[0].data() as User;
        this.updateFindedUser(findedUsr, chosenAvatar, displayName);
        this.createNewWorkspace(findedUsr);
      }
    });
  }

  private createNewWorkspace(findedUsr: User) {
    const workspaceName = this.workspaceFormGroup.value.workspaceNameFormControl;
    const workspace: Workspace = {
      name: workspaceName,
      isNewWorkspace: this.isNewWorkspace,
      isWithRequireAccess: this.isWorkspaceWithRequiredAccess,
      creationDate: formatDate(new Date(), 'yyyy/MM/dd', 'en')
    };

    this.firestoreRbService.addNewWorkspace(workspace).then(snapshotNewWorkspace => {
      snapshotNewWorkspace.get().then(newWorkspaceSnapshot => {
        const workspaceId = newWorkspaceSnapshot.id;
        const userWorkspace: UserWorkspaceToSave = {
          user: this.firestoreRbService.addUserAsRef(findedUsr),
          workspaces: [this.firestoreRbService.addWorkspaceAsRef(workspaceId)]
        };

        this.firestoreRbService.addNewUserWorkspace(userWorkspace);
      });
    });
  }

  private updateFindedUser(findedUsr: User, chosenAvatar: Avatar, displayName: any) {
    findedUsr.chosenAvatarUrl = chosenAvatar.avatarUrl;
    findedUsr.displayName = displayName;
    findedUsr.isNewUser = false;
    this.firestoreRbService.updateUsr(findedUsr);
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