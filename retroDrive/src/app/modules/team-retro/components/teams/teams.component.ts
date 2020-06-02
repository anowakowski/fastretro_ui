import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;
  currentUser: User;

  constructor(
    private localStorageService: LocalStorageService,
    private bottomSheetRef: MatBottomSheet,
    private firestoreService: FirestoreRetroBoardService,
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private eventsService: EventsService) { }

  teams: Team[];

  ngOnInit() {
    this.setItemFromLocalStorage();
    this.prepareTeamsForCurrentWorkspace();
  }

  private setItemFromLocalStorage() {
    this.currentUser = this.localStorageService.getItem('currentUser');
    if (this.currentUser === undefined) {
      this.authService.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getItem('userWorkspace');
        this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent).workspace;
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  prepareTeamsForCurrentWorkspace() {
    this.firestoreService.findUserTeamsSnapshotChanges(this.currentUser.uid).subscribe(userTeamsSnapshot => {
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

              if (findedWorkspace.id === this.currentWorkspace.id) {
                this.teams.push(findedUserTeam);
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

    dialogRef.afterClosed().subscribe(() => {
      this.prepareUserWorkspace();
    });
  }

  changeCurrentUserWorksapceDialog() {
    const dialogRef = this.dialog.open(ChangeCurrentUserWorksapceDialogComponent, {
      width: '600px',
      data: {
        currentUser: this.currentUser,
        userWorkspaces: this.userWorkspace
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      
    });
  }

  private prepareUserWorkspace() {
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
