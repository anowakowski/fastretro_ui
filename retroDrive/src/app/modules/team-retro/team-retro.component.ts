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

  ngOnInit() {
    this.spinnerTick();
    this.setupCurrentUserWithUserWorkspace();
  }

  ngOnDestroy(): void {
    this.unsubscribeTickService();
  }

  private setupCurrentUserWithUserWorkspace() {
    this.authService.user$.subscribe(currentUser => {
      this.localStorageService.setItem('currentUser', currentUser);
      this.prepareUserWorkspace(currentUser);
    });
  }

  private prepareUserWorkspace(currentUser: User) {
    const userWorkspace: UserWorkspace = this.createUserWorkspace(currentUser);
    this.firestoreRBServices.getUserWorkspace(currentUser.uid).then(userWorksapcesSnapshot => {
      if (userWorksapcesSnapshot.docs.length > 0) {
        userWorksapcesSnapshot.docs.forEach(userWorkspaceDoc => {
          const findedUserWorkspaceToSave = userWorkspaceDoc.data();
          findedUserWorkspaceToSave.workspaces.forEach(worskspaceRef => {
            worskspaceRef.get().then(findedUserWorkspaceToSaveDoc => {
              const userWorkspacesData = findedUserWorkspaceToSaveDoc.data() as WorkspaceToSave;
              userWorkspace.workspaces.push(userWorkspacesData);
              this.localStorageService.removeItem('userWorkspace');
              this.localStorageService.setItem('userWorkspace', userWorkspace);
            });
          });
        });
      }
    });
  }

  private createUserWorkspace(currentUser): UserWorkspace {
    return {
      user: currentUser,
      workspaces: new Array<WorkspaceToSave>()
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
      } else if (interval === 5) {
        this.spinner.hide();
        this.unsubscribeTickService();
      }
    });
  }
}
