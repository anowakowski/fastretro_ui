import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from 'src/app/models/team';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Workspace } from 'src/app/models/workspace';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { User } from 'src/app/models/user';
import { UserWorkspaceDataToSave } from 'src/app/models/userWorkspaceDataToSave';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { UserWorkspaceData } from 'src/app/models/userWorkspaceData';
import { LocalStorageService } from 'src/app/services/local-storage.service';

import { CurrentUserApiService } from 'src/app/services/current-user-api.service';
import { UserNotificationToSave } from 'src/app/models/UserNotificationToSave';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RetroBoardSnackbarComponent } from '../retro-board-snackbar/retro-board-snackbar.component';
import { formatDate } from '@angular/common';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';
import { WorkspaceToUpdateWorkspace } from 'src/app/models/workspaceToUpdateWorkspace';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UsersInTeamsToRemoveInApi } from 'src/app/models/usersInTeamsToRemoveInApi';

@Component({
  selector: 'app-leave-team-dialog',
  templateUrl: './leave-team-dialog.component.html',
  styleUrls: ['./leave-team-dialog.component.css']
})
export class LeaveTeamDialogComponent implements OnInit {

  teams: Team[];

  constructor(
    public dialogRef: MatDialogRef<LeaveTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserInRetroBoardApiService: CurrentUserApiService,) {}

  ngOnInit() {
    this.teams = this.data.teamsToLeave;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onLeaveTeams() {
    this.firestoreService.getUserTeams(this.data.currentUser.uid).then(userTeamsSnapshot => {
      const exisitngUserTeam = userTeamsSnapshot.docs[0].data() as UserTeamsToSave;
      const exisitngUserTeamId = userTeamsSnapshot.docs[0].id;

      const teamsToUpdate = [];
      exisitngUserTeam.teams.forEach(teamRef => {
        if (this.teams.some(t => t.id === teamRef.id) === false) {
          teamsToUpdate.push(teamRef);
        }
      });

      exisitngUserTeam.teams = teamsToUpdate;
      this.firestoreService.updateUserTeams(exisitngUserTeam, exisitngUserTeamId)
        .then(() => {
          const teamToRemove: UsersInTeamsToRemoveInApi[] = this.prepareTeamsToRemoveInApi();
          this.currentUserInRetroBoardApiService.removeUserInTeam(teamToRemove)
            .then(() => {
              this.dialogRef.close();
            })
            .catch(error => {
              const err = error;
            });
        });
    });
  }

  private prepareTeamsToRemoveInApi(): UsersInTeamsToRemoveInApi[] {
    return this.teams.map(t => {
      const userInTeamsToRemove: UsersInTeamsToRemoveInApi = {
        userFirebaseDocId: this.data.currentUser.uid,
        teamFirebaseDocId: t.id,
        workspaceFirebaseDocId: t.workspaceId
      };
      return userInTeamsToRemove;
    });
  }
}
