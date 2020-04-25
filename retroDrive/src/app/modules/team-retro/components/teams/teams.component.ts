import { Component, OnInit } from '@angular/core';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CreateNewTeamBottomsheetComponent } from '../create-new-team-bottomsheet/create-new-team-bottomsheet.component';
import { Workspace } from 'src/app/models/workspace';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Team } from 'src/app/models/team';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  userWorkspace: UserWorkspace;
  currentWorkspace: Workspace;

  constructor(
    private localStorageService: LocalStorageService,
    private bottomSheetRef: MatBottomSheet,
    private firestoreService: FirestoreRetroBoardService) { }

  teams: Team[];

  ngOnInit() {
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
}
