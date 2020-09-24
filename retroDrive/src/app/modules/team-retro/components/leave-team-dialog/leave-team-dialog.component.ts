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

@Component({
  selector: 'app-leave-team-dialog',
  templateUrl: './leave-team-dialog.component.html',
  styleUrls: ['./leave-team-dialog.component.css']
})
export class LeaveTeamDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LeaveTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public teamsToLeave: Team[],
    private firestoreService: FirestoreRetroBoardService) {}

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close({shouldRefreshTeams: false});
  }
}
