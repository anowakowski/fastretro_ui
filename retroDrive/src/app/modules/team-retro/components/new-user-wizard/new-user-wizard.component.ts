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
import { MatDialog } from '@angular/material/dialog';
import { NewUserWiazrdInfoDialogComponent } from '../new-user-wiazrd-info-dialog/new-user-wiazrd-info-dialog.component';
import { WorkspaceInfoDialogOptions } from 'src/app/models/workspaceInfoDialogOptions';
import { Router } from '@angular/router';

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

  configurationSaveProcessError: Array<string>;

  validateFromClick;

  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private firestoreRbService: FirestoreRetroBoardService,
    public dialog: MatDialog,
    public router: Router) { }

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

    const workspaceName = this.workspaceFormGroup.value.workspaceNameFormControl;
    this.firestoreRbService.findWorkspacesByName(workspaceName).then(workspaceSnapshot => {
      if (workspaceSnapshot.docs.length > 0 && this.isNewWorkspace) {
        const workspaceInfoOptions: WorkspaceInfoDialogOptions = {isCurrentlyInUse: true, isWrongNameOfExistingWorkspace: false};
        this.openInfoDialog(workspaceInfoOptions);
      } else if (workspaceSnapshot.docs.length === 0 && !this.isNewWorkspace) {
        const workspaceInfoOptions: WorkspaceInfoDialogOptions = {isCurrentlyInUse: false, isWrongNameOfExistingWorkspace: true};
        this.openInfoDialog(workspaceInfoOptions);
      } else {
        this.firestoreRbService.findUsersByEmail(this.currentUser.email).then(snapshotFindedUsr => {
          if (snapshotFindedUsr.docs.length > 0) {
            const findedUsr = snapshotFindedUsr.docs[0].data() as User;
            this.updateFindedUser(findedUsr, chosenAvatar, displayName);
            this.createWorkspaceProcess(findedUsr);

          }
        });
      }
    });
  }

  nextStep(event) {
    console.log(event);
    this.validateFromClick = true;
    this.localStorageService.setItem('shouldValidateWorkspace', true);


    this.workspaceNameFormControl.updateValueAndValidity();


    //this.stepper.previous();
  }

  private openInfoDialog(workspaceInfoOptions: WorkspaceInfoDialogOptions) {
    const dialogRef = this.dialog.open(NewUserWiazrdInfoDialogComponent, {
      width: '400px',
      data: workspaceInfoOptions
    });

    dialogRef.afterClosed().subscribe(() => {
      this.stepper.selectedIndex = 0;
    });
  }

  private createWorkspaceProcess(findedUsr: User) {
    if (this.isNewWorkspace) {
      this.createNewWorkspace(findedUsr);
    } else {
      this.addUserToExistingWorkspaces(findedUsr);
    }
  }

  private addUserToExistingWorkspaces(findedUsr: User) {
    const workspaceName = this.workspaceFormGroup.value.workspaceNameFormControl;
    this.firestoreRbService.findWorkspacesByName(workspaceName).then(workspaceSnapshot => {
      if (workspaceSnapshot.docs.length > 0) {
        workspaceSnapshot.docs.forEach(workspaceDoc => {
          const workspacesId = workspaceDoc.id;
          this.createUserWorkspaces(findedUsr, workspacesId);
        });
      } else {}
    });
  }

  private createNewWorkspace(findedUsr: User) {
    const workspaceName = this.workspaceFormGroup.value.workspaceNameFormControl;
    const workspace: Workspace = this.prepareWorkspaceModel(workspaceName);

    this.firestoreRbService.addNewWorkspace(workspace).then(snapshotNewWorkspace => {
      snapshotNewWorkspace.get().then(newWorkspaceSnapshot => {
        const workspaceId = newWorkspaceSnapshot.id;
        this.createUserWorkspaces(findedUsr, workspaceId);
      });
    });
  }

  private prepareWorkspaceModel(workspaceName: any): Workspace {
    return {
      name: workspaceName,
      isNewWorkspace: this.isNewWorkspace,
      isWithRequireAccess: this.isWorkspaceWithRequiredAccess,
      creationDate: formatDate(new Date(), 'yyyy/MM/dd', 'en')
    };
  }

  private createUserWorkspaces(findedUsr: User, workspaceId: string) {
    const userWorkspace: UserWorkspaceToSave = {
      user: this.firestoreRbService.addUserAsRef(findedUsr),
      workspaces: [this.firestoreRbService.addWorkspaceAsRef(workspaceId)]
    };
    this.firestoreRbService.addNewUserWorkspace(userWorkspace);
    location.reload();
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
    }, {validators: [this.workspaceValidation]}),
    this.avatarsFormGroup = this.formBuilder.group({
      avatarsNameFormControl: this.avatarsNameFormControl
    });
  }

  public tag = 'hello';
  public existingTags = ['hello', 'world'];

  public getValidError() {
    return this.workspaceFormGroup.valid;
  }


  private workspaceValidation(form: FormGroup) {
    let tt = form;

    return { notValidData: true };
  }
}
