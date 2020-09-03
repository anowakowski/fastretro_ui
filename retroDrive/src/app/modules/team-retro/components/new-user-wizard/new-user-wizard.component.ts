import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {formatDate} from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { Avatar } from 'src/app/models/avatar';
import { MatStepper } from '@angular/material/stepper';
import { retryWhen, find } from 'rxjs/operators';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { MatDialog } from '@angular/material/dialog';
import { NewUserWiazrdInfoDialogComponent } from '../new-user-wiazrd-info-dialog/new-user-wiazrd-info-dialog.component';
import { WorkspaceInfoDialogOptions } from 'src/app/models/workspaceInfoDialogOptions';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RetroBoardSnackbarComponent } from '../retro-board-snackbar/retro-board-snackbar.component';
import { UserWorkspaceData } from 'src/app/models/userWorkspaceData';
import { UserWorkspaceDataToSave } from 'src/app/models/userWorkspaceDataToSave';
import { UserNotificationToSave } from 'src/app/models/UserNotificationToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { Workspace } from 'src/app/models/workspace';

@Component({
  selector: 'app-new-user-wizard',
  templateUrl: './new-user-wizard.component.html',
  styleUrls: ['./new-user-wizard.component.css']
})
export class NewUserWizardComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper: MatStepper;

  isLinear = false;

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

  shouldValidateWorkspaceName;

  dataIsLoading = false;

  shouldShowInfoAboutRequireAccessForChosenWorkspaceName: boolean;

  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private firestoreRbService: FirestoreRetroBoardService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    public router: Router) { }


  ngOnInit() {
    this.currentUser = this.localStorageService.getDecryptedItem(this.localStorageService.currentUserKey);

    // this.avatars = [
    //   {avatarUrl: 'https://robohash.org/PC1.png?set=set2', isChosen: false, id: 1},
    //   {avatarUrl: 'https://robohash.org/PC2.png?set=set2', isChosen: false, id: 2},
    //   {avatarUrl: 'https://robohash.org/PC3.png?set=set2', isChosen: false, id: 3},
    //   {avatarUrl: 'https://robohash.org/PC4.png?set=set2', isChosen: false, id: 4},
    //   {avatarUrl: 'https://robohash.org/PC5.png?set=set2', isChosen: false, id: 5}
    // ];


    this.avatars = [
      {avatarName: 'avatar1', isChosen: false, id: 1},
      {avatarName: 'avatar2', isChosen: false, id: 2},
      {avatarName: 'avatar3', isChosen: false, id: 3},
      {avatarName: 'avatar4', isChosen: false, id: 4},
      {avatarName: 'avatar5', isChosen: false, id: 5},
      {avatarName: 'avatar6', isChosen: false, id: 6}
    ];

    if (this.currentUser.photoURL !== null) {
      // this.avatars.push({avatarUrl: this.currentUser.photoURL, isChosen: false, id: 6});
    }

    this.createFormsBuild();

    this.avatarsNameFormControl.setValue(this.currentUser.splayName);
    this.setRandomAvatar();

    this.clearLocalStorage();
  }

  ngOnDestroy(): void {
    this.clearLocalStorage();
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
            if (workspaceSnapshot.docs.length > 0) {
              const findedWorkspace = workspaceSnapshot.docs[0].data() as Workspace;
              this.createWorkspaceProcess(findedUsr, findedWorkspace.isWithRequireAccess);
            } else {
              this.createWorkspaceProcess(findedUsr);
            }
          }
        });
      }
    });
  }

  nextStepFromWorkspaceNameToAvatar() {
    if (this.workspaceFormGroup.valid || this.workspaceNameFormControl.value !== '') {
      this.shouldValidateWorkspaceName = true;
      const workspaceName = this.workspaceNameFormControl.value;
      this.dataIsLoading = true;
      const shouldGoToNextStep = true;

      this.workspaceNameValidationProcess(workspaceName, shouldGoToNextStep);
    }
  }

  nextStepFromAvatarToSummary() {
    this.firestoreRbService.findWorkspacesByName(this.workspaceNameFormControl.value).then(workspaceSnapshot => {
      workspaceSnapshot.docs.forEach(workspaceDoc => {
        const findedWorkspace = workspaceDoc.data() as WorkspaceToSave;
        this.shouldShowInfoAboutRequireAccessForChosenWorkspaceName = findedWorkspace.isWithRequireAccess;
      });
    });

    if (this.avatarsFormGroup.valid) {
      this.stepper.next();
    }
  }

  private workspaceNameValidationProcess(workspaceName: any, shouldGoToNextStep: boolean) {
    this.firestoreRbService.findWorkspacesByName(workspaceName).then(workspaceSnapshot => {
      if (workspaceSnapshot.docs.length > 0 && this.isNewWorkspace) {
        this.processingValidationWhenWorkspaceExists();
      } else if (workspaceSnapshot.docs.length === 0 && !this.isNewWorkspace) {
        this.processingValidationWhenWorkspaceNotExists();
      } else if (shouldGoToNextStep) {
        this.dataIsLoading = false;
        this.clearLocalStorage();
        this.stepper.next();
      }
    });
  }

  openRetroBoardSnackbar(textToDisplay) {
    const durationInSeconds = 5;
    this.snackBar.openFromComponent(RetroBoardSnackbarComponent, {
      duration: durationInSeconds * 1000,
      data: {
        displayText: '' + textToDisplay
      }
    });
  }

  private processingValidationWhenWorkspaceNotExists() {
    this.clearLocalStorage();
    this.dataIsLoading = false;
    this.localStorageService.setItem('shouldShowCantFindWorkspace', true);
    this.openRetroBoardSnackbar('This workspace name is not exists. Please check your workspace name');
    this.workspaceNameFormControl.updateValueAndValidity();
  }

  private processingValidationWhenWorkspaceExists() {
    this.clearLocalStorage();
    this.dataIsLoading = false;
    this.localStorageService.setItem('shouldShowWithWorkspaceExists', true);
    this.openRetroBoardSnackbar('This workspace name is currently in use. Please change your workspace name or joint to existing');
    this.workspaceNameFormControl.updateValueAndValidity();
  }

  private clearLocalStorage() {
    this.localStorageService.removeItem('shouldShowWithWorkspaceExists');
    this.localStorageService.removeItem('shouldShowCantFindWorkspace');
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

  private createWorkspaceProcess(findedUsr: User, isWithRequireAccess: boolean = false) {
    if (this.isNewWorkspace) {
      this.createNewWorkspace(findedUsr);
    } else if (!this.isNewWorkspace && !isWithRequireAccess) {
      this.addUserToExistingWorkspaces(findedUsr);
    } else if (!this.isNewWorkspace && isWithRequireAccess) {
      this.setWorkpsaceProcessWithRequiredAccess(findedUsr);
    }
  }

  private setWorkpsaceProcessWithRequiredAccess(userToWantToJoin: User) {
    const workspaceName = this.workspaceFormGroup.value.workspaceNameFormControl;
    this.firestoreRbService.findWorkspacesByName(workspaceName).then(workspaceSnapshot => {
      if (workspaceSnapshot.docs.length === 0) {

      } else {
        const findedWorkspaceDoc = workspaceSnapshot.docs[0];
        const workspaceId = findedWorkspaceDoc.id;
        const findedWorkspace = findedWorkspaceDoc.data();
        this.setNotification(findedWorkspace, workspaceId, workspaceName, userToWantToJoin);
      }
    });
  }

  private createNewWorkspaceForDefaultWorkspace(findedUsr: User) {
    const workspaceName = findedUsr.displayName + '- default workspace';
    const workspace: WorkspaceToSave = this.prepareWorkspaceModel(workspaceName,  findedUsr.uid);

    this.firestoreRbService.addNewWorkspace(workspace).then(snapshotNewWorkspace => {
      snapshotNewWorkspace.get().then(newWorkspaceSnapshot => {
        const workspaceId = newWorkspaceSnapshot.id;
        this.createUserWorkspaces(findedUsr, workspaceId);
      });
    });
  }

  private setNotification(
    findedWorkspace,
    workspaceId: string,
    workspaceName: any,
    userToWantToJoin: User) {
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    const usrNotificationToSave = {creationDate: currentDate, userId: findedWorkspace.creatorUserId};
    this.firestoreRbService.addNewUserNotification(usrNotificationToSave).then(userNotificationSnapshot => {
      const userNotificationDocId = userNotificationSnapshot.id;
      this.setUserNotificationInCurrentUserApi(findedWorkspace, workspaceId, workspaceName, userToWantToJoin, userNotificationDocId);
    });
  }

  private setUserNotificationInCurrentUserApi(
    findedWorkspace: any,
    workspaceId: string,
    workspaceName: any,
    userToWantToJoin: User,
    userNotificationDocId: string) {
    const userNotyfication: UserNotificationToSave =
      this.prepareUserNotification(findedWorkspace, workspaceId, workspaceName, userToWantToJoin, userNotificationDocId);
    this.currentUserInRetroBoardApiService.setUserNotification(userNotyfication)
      .then(() => {
        this.createNewWorkspaceForDefaultWorkspace(userToWantToJoin);
      })
      .catch(error => {
        const err = error;
      });
  }

  private prepareUserNotification(
    findedWorkspace,
    workspaceId: string,
    workspaceName: any,
    userToWantToJoin: User,
    userNotificationFirebaseDocId: string): UserNotificationToSave {
    return {
      userWantToJoinFirebaseId: userToWantToJoin.uid,
      creatorUserFirebaseId: findedWorkspace.creatorUserId,
      workspceWithRequiredAccessFirebaseId: workspaceId,
      workspaceName,
      displayName: userToWantToJoin.displayName,
      email: userToWantToJoin.email,
      userNotificationFirebaseDocId
    };
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
    const workspace: WorkspaceToSave = this.prepareWorkspaceModel(workspaceName,  findedUsr.uid);

    this.firestoreRbService.addNewWorkspace(workspace).then(snapshotNewWorkspace => {
      snapshotNewWorkspace.get().then(newWorkspaceSnapshot => {
        const workspaceId = newWorkspaceSnapshot.id;
        this.createUserWorkspaces(findedUsr, workspaceId);
      });
    });
  }

  private prepareWorkspaceModel(workspaceName: any, createrUserId: string): WorkspaceToSave {
    return {
      name: workspaceName,
      isNewWorkspace: this.isNewWorkspace,
      isWithRequireAccess: this.isWorkspaceWithRequiredAccess,
      creatorUserId: createrUserId,
      creationDate: formatDate(new Date(), 'yyyy/MM/dd', 'en')
    };
  }

  private createUserWorkspaces(findedUsr: User, workspaceId: string) {
    const workspacesToAddToUserWorkspace: UserWorkspaceDataToSave = {
      workspace: this.firestoreRbService.addWorkspaceAsRef(workspaceId),
      isCurrent: true
    };

    const userWorkspace: UserWorkspaceToSave = {
      userId: findedUsr.uid,
      workspaces: [workspacesToAddToUserWorkspace]
    };
    this.firestoreRbService.addNewUserWorkspace(userWorkspace);
    location.reload();
  }

  private updateFindedUser(findedUsr: User, chosenAvatar: Avatar, displayName: any) {
    findedUsr.chosenAvatarName = chosenAvatar.avatarUrl;
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

  public getValidError() {
    return this.workspaceFormGroup.valid;
  }


  private workspaceValidation(form: FormGroup) {
    // tslint:disable-next-line:prefer-const
    let tt = form;

    return { notValidData: true };
  }
}
