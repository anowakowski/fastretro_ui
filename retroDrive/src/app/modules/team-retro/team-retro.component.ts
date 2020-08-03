import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerTickService } from 'src/app/services/spinner-tick.service';
import { interval } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { FirestoreRetroBoardService } from './services/firestore-retro-board.service';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';
import { User } from 'firebase';
import { Workspace } from 'src/app/models/workspace';
import { UserWorkspaceData } from 'src/app/models/userWorkspaceData';

@Component({
  selector: 'app-team-retro',
  templateUrl: './team-retro.component.html',
  styleUrls: ['./team-retro.component.css']
})
export class TeamRetroComponent implements OnInit, OnDestroy {
  constructor(
    private spinner: NgxSpinnerService,
    private spinnerTickService: SpinnerTickService,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private firestoreRBServices: FirestoreRetroBoardService) { }

  shouldShowContent = false;
  private spinnerTickSubscription: any;
  private userSubscritpion: any;

  ngOnInit() {
    this.spinnerTick();
    this.setupCurrentUserWithUserWorkspace();
  }

  ngOnDestroy(): void {
    this.unsubscribeTickService();
    this.userSubscritpion.unsubscribe();
  }

  private setupCurrentUserWithUserWorkspace() {
    this.userSubscritpion = this.authService.user$.subscribe(currentUser => {
      this.localStorageService.setEncryptedItem(this.localStorageService.currentUserKey, currentUser);
      if (currentUser !== undefined) {
        if (!currentUser.isNewUser) {
          this.prepareUserWorkspace(currentUser);
        }
      }
    });
  }

  private prepareUserWorkspace(currentUser: User) {
    const userWorkspace: UserWorkspace = this.createUserWorkspace(currentUser);
    this.firestoreRBServices.getUserWorkspace(currentUser.uid).then(userWorksapcesSnapshot => {
      if (userWorksapcesSnapshot.docs.length > 0) {
        userWorksapcesSnapshot.docs.forEach(userWorkspaceDoc => {
          const findedUserWorkspaceToSave = userWorkspaceDoc.data();
          userWorkspace.id = userWorkspaceDoc.id;
          findedUserWorkspaceToSave.workspaces.forEach(worskspaceData => {
            worskspaceData.workspace.get().then(findedUserWorkspaceToSaveDoc => {
              const userWorkspacesData = findedUserWorkspaceToSaveDoc.data() as Workspace;
              userWorkspacesData.id = findedUserWorkspaceToSaveDoc.id;
              const userWorkspacesDataToAdd: UserWorkspaceData = {
                workspace: userWorkspacesData,
                isCurrent: worskspaceData.isCurrent
              };

              userWorkspace.workspaces.push(userWorkspacesDataToAdd);
              this.localStorageService.removeItem(this.localStorageService.userWorkspaceKey);
              this.localStorageService.setEncryptedItem(this.localStorageService.userWorkspaceKey, userWorkspace);
            });
          });
        });
      }
    });
  }

  private createUserWorkspace(currentUser): UserWorkspace {
    return {
      id: '',
      user: currentUser,
      workspaces: new Array<UserWorkspaceData>()
    };
  }

  private unsubscribeTickService() {
    this.spinnerTickSubscription.unsubscribe();
  }

  private spinnerTick() {
    this.spinner.show();
    // tslint:disable-next-line:no-shadowed-variable
    this.spinnerTickSubscription = this.spinnerTickService.runNewTimer(1000).subscribe((interval) => {
      if (interval === 1) {
        this.shouldShowContent = true;
      } else if (interval === 4) {
        this.spinner.hide();
        this.unsubscribeTickService();
      }
    });
  }
}
