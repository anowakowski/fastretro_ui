import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CreateNewTeamBottomsheetComponent } from '../create-new-team-bottomsheet/create-new-team-bottomsheet.component';
import { Workspace } from 'src/app/models/workspace';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Team } from 'src/app/models/team';
import { JoinToExistingTeamDialogComponent } from '../join-to-existing-team-dialog/join-to-existing-team-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { UserTeams } from 'src/app/models/userTeams';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { JoinToExistingWorkspaceDialogComponent } from '../join-to-existing-workspace-dialog/join-to-existing-workspace-dialog.component';
import { UserWorkspaceData } from 'src/app/models/userWorkspaceData';
import { EventsService } from 'src/app/services/events.service';
// tslint:disable-next-line:max-line-length
import { ChangeCurrentUserWorksapceDialogComponent } from '../change-current-user-worksapce-dialog/change-current-user-worksapce-dialog.component';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { UserNotificationWorkspaceWithRequiredAccess } from 'src/app/models/userNotificationWorkspaceWithRequiredAccess';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit, OnDestroy {

  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;
  currentUser: User;
  teamsSubscriptions: any;
  workspaceNameForRequiredAccess: any;
  userNotificationWorkspaceWithRequiredAccessForWaitingRequests = new Array<UserNotificationWorkspaceWithRequiredAccess>();
  //currentWorkspaceId: string;

  constructor(
    private localStorageService: LocalStorageService,
    private bottomSheetRef: MatBottomSheet,
    private firestoreService: FirestoreRetroBoardService,
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private eventsService: EventsService,
    private currentUserInRetroBoardApiService: CurrentUserApiService) { }

    teams: Team[];

  ngOnInit() {
    this.setItemFromLocalStorage();
    this.prepareTeamsForCurrentWorkspace();
    this.getAllWaitingWorkspaceRequests();
    this.prepareFreshUserWorkspace();
  }

  ngOnDestroy(): void {
    this.teamsSubscriptions.unsubscribe();
  }

  private setItemFromLocalStorage() {
    this.currentUser = this.localStorageService.getItem('currentUser');
    if (this.currentUser === undefined) {
      this.authService.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getItem('userWorkspace');
        this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;
        //this.currentWorkspaceId = this.currentWorkspace.id;
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  prepareTeamsForCurrentWorkspace(currentWorkspaceIdAfterChanage: string = null) {
    this.teamsSubscriptions = this.firestoreService.findUserTeamsSnapshotChanges(this.currentUser.uid).subscribe(userTeamsSnapshot => {
      this.teams = new Array<Team>();
      userTeamsSnapshot.forEach(userTeamSnapshot => {
        const userTeams = userTeamSnapshot.payload.doc.data() as UserTeamsToSave;
        userTeams.teams.forEach(teamRef => {
          teamRef.get().then(teamDoc => {
            const findedUserTeam = teamDoc.data();
            findedUserTeam.id = teamDoc.id as string;
            findedUserTeam.workspace.get().then(workspaceSnapshot => {
              const userTeamToAdd = findedUserTeam as Team;
              const findedWorkspace = workspaceSnapshot.data() as Workspace;
              findedWorkspace.id = workspaceSnapshot.id;
              userTeamToAdd.workspace = findedWorkspace;

              if (currentWorkspaceIdAfterChanage !== null) {
                if (findedWorkspace.id === currentWorkspaceIdAfterChanage) {
                  this.teams.push(findedUserTeam);
                }
              } else if (currentWorkspaceIdAfterChanage === null) {
                if (findedWorkspace.id === this.currentWorkspace.id) {
                  this.teams.push(findedUserTeam);
                }
              }
            });
          });
        });
      });
    });
  }

  isExistingTeams() {
    let result = false;

    if (this.teams !== undefined) {
      if (this.teams.length !== undefined) {
        result = this.teams.length > 0;
      }
    }

    return result;
  }

  createNewTeamBottomShet() {
    const bottomSheetRef = this.bottomSheetRef.open(CreateNewTeamBottomsheetComponent, {
      data: {
        currentWorkspace: this.currentWorkspace,
        currentUser: this.currentUser
      }
    });

    bottomSheetRef.afterDismissed().subscribe(() => {});
  }

  jointToExisitngTeamDialog() {
    const dialogRef = this.dialog.open(JoinToExistingTeamDialogComponent, {
      width: '600px',
      data: {
        currentWorkspace: this.currentWorkspace,
        currentUser: this.currentUser
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
    });
  }

  jointToExisitngWorkspaceDialog() {
    const dialogRef = this.dialog.open(JoinToExistingWorkspaceDialogComponent, {
      width: '600px',
      data: {
        currentWorkspace: this.currentWorkspace,
        currentUser: this.currentUser,
        userWorkspace: this.userWorkspace
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.shouldRefreshTeams) {
          const chosenWorkspaceId = result.workspaceId;
          this.prepareFreshUserWorkspace();
          this.teamsSubscriptions.unsubscribe();
          this.prepareTeamsForCurrentWorkspace(chosenWorkspaceId);
        } else if (!result.shouldRefreshTeams && result.shouldShowRequestForWorkspaceWithRequiredAccess) {
          this.getAllWaitingWorkspaceRequests();
        }
      }
    });
  }

  changeCurrentUserWorksapceDialog() {
    const dialogRef = this.dialog.open(ChangeCurrentUserWorksapceDialogComponent, {
      width: '600px',
      data: {
        currentUser: this.currentUser,
        userWorkspaces: this.userWorkspace,
        currentWorkspace: this.currentWorkspace
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.shouldRefreshTeams) {
          const chosenWorkspaceId = result.chosenWorkspaceId;
          this.prepareFreshUserWorkspace();
          this.teamsSubscriptions.unsubscribe();
          this.prepareTeamsForCurrentWorkspace(chosenWorkspaceId);
        }
      }
    });
  }

  private getAllWaitingWorkspaceRequests() {
    this.currentUserInRetroBoardApiService.getAllWaitingWorkspaceRequests(
      this.currentUser.uid
    ).then(response => {
      if (response !== undefined && response !== null) {
        this.userNotificationWorkspaceWithRequiredAccessForWaitingRequests = response;
      }
    });
  }

  private prepareFreshUserWorkspace() {
    const userWorkspace: UserWorkspace = this.createUserWorkspace(this.currentUser);
    this.firestoreService.getUserWorkspace(this.currentUser.uid).then(userWorksapcesSnapshot => {
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
              this.userWorkspace.workspaces = userWorkspace.workspaces;

              this.localStorageService.removeItem('userWorkspace');
              this.localStorageService.setItem('userWorkspace', userWorkspace);

              findedUserWorkspaceToSave.workspaces.find(uw => uw.isCurrent).workspace.get().then(currWokrspaceSnapshot => {
                const currentWorkspaceToAdd = currWokrspaceSnapshot.data() as Workspace;
                currentWorkspaceToAdd.id = currWokrspaceSnapshot.id as string;
                this.currentWorkspace = currentWorkspaceToAdd;
                this.eventsService.emitSetNewCurrentWorkspaceEmiter(this.currentWorkspace);
              });
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
}
