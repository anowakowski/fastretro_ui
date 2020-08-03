import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerTickService } from 'src/app/services/spinner-tick.service';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { UserWorkspaceData } from 'src/app/models/userWorkspaceData';
import { Workspace } from 'src/app/models/workspace';
import { User } from 'firebase';
import { FiresrtoreRetroProcessInProgressService } from './services/firesrtore-retro-process-in-progress.service';

@Component({
  selector: 'app-team-retro-process-in-progress',
  templateUrl: './team-retro-process-in-progress.component.html',
  styleUrls: ['./team-retro-process-in-progress.component.css']
})
export class TeamRetroProcessInProgressComponent implements OnInit, OnDestroy {

  data: any;
  shouldShowContent = false;
  private spinnerTickSubscription: any;
  private userSubscritpion: any;

  constructor(
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private spinnerTickService: SpinnerTickService,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private firestoreRetroInProgressService: FiresrtoreRetroProcessInProgressService) { }

  ngOnInit() {
    this.spinnerTick();
    this.setupCurrentUserWithUserWorkspace();
  }

  ngOnDestroy(): void {
    this.unsubscribeTickService();
  }

  private setupCurrentUserWithUserWorkspace() {
    this.userSubscritpion = this.authService.user$.subscribe(currentUser => {
      this.localStorageService.setItem('currentUser', currentUser);
      this.localStorageService.setEncryptedItem(this.localStorageService.currentUserKey, currentUser);
      this.prepareUserWorkspace(currentUser);
    });
  }

  private prepareUserWorkspace(currentUser: User) {
    const userWorkspace: UserWorkspace = this.createUserWorkspace(currentUser);
    this.firestoreRetroInProgressService.getUserWorkspace(currentUser.uid).then(userWorksapcesSnapshot => {
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
              this.localStorageService.removeItem('userWorkspace');
              this.localStorageService.setItem('userWorkspace', userWorkspace);

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
    this.spinnerTickSubscription = this.spinnerTickService.runNewTimer(1000).subscribe((interval) => {
      if (interval === 1) {
        this.shouldShowContent = true;
      } else if (interval === 2) {
        this.spinner.hide();
        this.unsubscribeTickService();
      }
    });
  }
}
