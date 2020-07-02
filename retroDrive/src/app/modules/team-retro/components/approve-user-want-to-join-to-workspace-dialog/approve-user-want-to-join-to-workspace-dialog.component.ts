import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from 'src/app/models/team';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { Workspace } from 'src/app/models/workspace';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { UserWorkspaceToSave } from 'src/app/models/userWorkspacesToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';

@Component({
  selector: 'app-approve-user-want-to-join-to-workspace-dialog',
  templateUrl: './approve-user-want-to-join-to-workspace-dialog.component.html',
  styleUrls: ['./approve-user-want-to-join-to-workspace-dialog.component.css']
})

export class ApproveUserWantToJoinToWorkspaceDialogComponent implements OnInit {

  joinToExisitngTeamForm: FormGroup;
  existingTeamIdFormControl = new FormControl('');

  dataIsLoading = true;
  thisWorkspaceHasAnyTeams = false;

  constructor(
    public dialogRef: MatDialogRef<ApproveUserWantToJoinToWorkspaceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreRetroBoardService,
    private formBuilder: FormBuilder,
    private currentUserApiService: CurrentUserApiService
  ) {}

  teams: Team[];

  ngOnInit() {
    this.prepareTeamsForCurrentWorkspace();
    this.createActionForRetroBoardForm();
  }

  prepareTeamsForCurrentWorkspace() {
    this.teams = new Array<Team>();
    this.firestoreService.findTeamsInCurrentWorkspace(this.data.currentWorkspace.id).then(teamsSnapshot => {
      if (teamsSnapshot.docs.length > 0) {
        teamsSnapshot.forEach(teamSnapshot => {
          const team = teamSnapshot.data() as Team;
          const teamId = teamSnapshot.id as string;
          team.id = teamId;
          this.teams.push(team);
          this.getUserTeamsForRemovingCurrentlyJoinedTeam();
        });
      } else {
        this.thisWorkspaceHasAnyTeams = true;
        this.dataIsLoading = false;
      }
    });
  }

  joinToExisitngTeam() {
    const chosenTeamId = this.joinToExisitngTeamForm.value.existingTeamIdFormControl;

    this.firestoreService.getUserTeams(this.data.currentUser.uid).then(userTeamsSnapshot => {
      const isExistngUserTeams = userTeamsSnapshot.docs.length > 0;
      if (isExistngUserTeams) {
        const exisitngUserTeam = userTeamsSnapshot.docs[0].data() as UserTeamsToSave;
        const exisitngUserTeamId = userTeamsSnapshot.docs[0].id;
        exisitngUserTeam.teams.push(this.firestoreService.addTeamAsRef(chosenTeamId));
        this.firestoreService.updateUserTeams(exisitngUserTeam, exisitngUserTeamId);
      } else {
        const userTeamsToSave: UserTeamsToSave = {
          userId: this.data.currentUser.uid,
          teams: [this.firestoreService.addTeamAsRef(chosenTeamId)]
        };
        this.firestoreService.addNewUserTeams(userTeamsToSave);
      }

      if (this.currentUserApiService.isTokenExpired()) {
        this.currentUserApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
          this.currentUserApiService.setRegeneratedToken(refreshedTokenResponse);
          this.setUserInTeamInApi(chosenTeamId);
        });
      } else {
        this.setUserInTeamInApi(chosenTeamId);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private setUserInTeamInApi(newTeamId: string) {
    this.currentUserApiService.setUserInTeam(
        this.data.currentUser.uid,
        newTeamId,
        this.data.currentWorkspace.id,
        this.data.currentUser.chosenAvatarUrl,
        this.data.currentUser.displayName)
          .then(() => {
            this.dialogRef.close();
          });
  }

  private getUserTeamsForRemovingCurrentlyJoinedTeam() {
    this.firestoreService.getUserTeams(this.data.currentUser.uid).then(userTeamsSnapshot => {
      if (userTeamsSnapshot.docs.length > 0) {
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
      } else {
        this.dataIsLoading = false;
      }
   });
  }

  private removeFromLocalTeamsIfFindedTeamsIsCurrentlyAdded(findedUserTeam: Team) {
    if (this.isExistingTeam(findedUserTeam)) {
      const findedTeamOnLocal = this.teams.find(t => t.id === findedUserTeam.id);
      const teamArrayIndex = this.getTeamsArrayIndex(findedTeamOnLocal);
      this.removeFromLocalTeams(teamArrayIndex);
    }
    this.dataIsLoading = false;
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
