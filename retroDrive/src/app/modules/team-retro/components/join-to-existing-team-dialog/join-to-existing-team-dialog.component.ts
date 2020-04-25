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
    this.firestoreService.findTeamsInCurrentWorkspace(this.data.currentWorkspace.id).then(teamsSnapshot => {
      teamsSnapshot.forEach(teamSnapshot => {
        const team = teamSnapshot.data() as Team;
        const teamId = teamSnapshot.id as string;
        team.id = teamId;
        this.teams.push(team);
        this.getUserTeamsForRemovingCurrentlyJoinedTeam();
      });
    });
  }

  joinToExisitngTeam() {
    const chosenTeamId = this.joinToExisitngTeamForm.value.existingTeamIdFormControl;
    const userTeamsToSave: UserTeamsToSave = {
      userId: this.data.currentUser.uid,
      teams: [this.firestoreService.addTeamAsRef(chosenTeamId)]
    };

    this.firestoreService.addNewUserTeams(userTeamsToSave);
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private getUserTeamsForRemovingCurrentlyJoinedTeam() {
    this.firestoreService.getUserTeams(this.data.currentUser.uid).then(userTeamsSnapshot => {
      userTeamsSnapshot.docs.forEach(userTeamDoc => {
        const findedUserTeamData = userTeamDoc.data();
        findedUserTeamData.teams.forEach(teamRef => {
         teamRef.get().then(teamDoc => {
           const findedUserTeam = teamDoc.data() as Team;
           findedUserTeam.id = teamDoc.id as string;

           this.removeFromLocalTeamsIfFindedTeamsIsCurrentlyAdded(findedUserTeam);
         });
        });
      });
   });
  }

  private removeFromLocalTeamsIfFindedTeamsIsCurrentlyAdded(findedUserTeam: Team) {
    if (this.isExistingTeam(findedUserTeam)) {
      const findedTeamOnLocal = this.teams.find(t => t.id === findedUserTeam.id);
      const teamArrayIndex = this.getTeamsArrayIndex(findedTeamOnLocal);
      this.removeFromLocalTeams(teamArrayIndex);
    }
  }

  private removeFromLocalTeams(teamArrayIndex: number) {
    this.teams.splice(teamArrayIndex, 1);
  }

  private isExistingTeam(findedUserTeam: Team) {
    return this.teams.some(t => t.id === findedUserTeam.id);
  }



  private createActionForRetroBoardForm() {
    this.joinToExisitngTeamForm = this.formBuilder.group({
      existingTeamIdFormControl: this.existingTeamIdFormControl,
    });
  }

  private getTeamsArrayIndex(findedTeamOnLocal: Team) {
    return this.teams.indexOf(findedTeamOnLocal);
  }

}
