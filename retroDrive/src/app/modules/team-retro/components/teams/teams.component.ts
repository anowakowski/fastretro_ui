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
    public dialog: MatDialog) { }

  teams: Team[];

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
    this.currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent);
    this.prepareTeamsForCurrentWorkspace();
  }

  prepareTeamsForCurrentWorkspace() {
    this.teams = new Array<Team>();
    this.firestoreService.findTeamsInCurrentWorkspaceSnapshotChanges(this.currentWorkspace.id).subscribe(teamsSnapshot => {
      teamsSnapshot.forEach(teamSnapshot => {
        const team = teamSnapshot.payload.doc.data() as Team;
        const teamId = teamSnapshot.payload.doc.id as string;
        team.id = teamId;
        this.teams.push(team);
      });
    });
  }

  createNewTeamBottomShet() {
    const bottomSheetRef = this.bottomSheetRef.open(CreateNewTeamBottomsheetComponent, {
      data: this.currentWorkspace
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
}
