import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from 'src/app/models/team';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Workspace } from 'src/app/models/workspace';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';

@Component({
  selector: 'app-join-to-existing-team-dialog',
  templateUrl: './join-to-existing-team-dialog.component.html',
  styleUrls: ['./join-to-existing-team-dialog.component.css']
})
export class JoinToExistingTeamDialogComponent implements OnInit {

  joinToExisitngTeamForm: FormGroup;
  existingTeamIdFormControl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<JoinToExistingTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private formBuilder: FormBuilder
  ) {}

  teams: Team[];

  ngOnInit() {
    this.prepareTeamsForCurrentWorkspace();
    this.createActionForRetroBoardForm();
  }

  prepareTeamsForCurrentWorkspace() {
    this.teams = new Array<Team>();
    this.firestoreService.findTeamsInCurrentWorkspaceSnapshotChanges(this.data.currentWorkspace.id).subscribe(teamsSnapshot => {
      teamsSnapshot.forEach(teamSnapshot => {
        const team = teamSnapshot.payload.doc.data() as Team;
        const teamId = teamSnapshot.payload.doc.id as string;
        team.id = teamId;
        this.teams.push(team);
      });
    });
  }

  joinToExisitngTeam() {
    const chosenTeamId = this.joinToExisitngTeamForm.value.existingTeamIdFormControl;
    const userTeamsToSave: UserTeamsToSave = {
      userId: this.data.currentUser.uid,
      teams: [this.firestoreService.addTeamAsRef(chosenTeamId)]
    };

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private createActionForRetroBoardForm() {
    this.joinToExisitngTeamForm = this.formBuilder.group({
      existingTeamIdFormControl: this.existingTeamIdFormControl,
    });
  }

}
