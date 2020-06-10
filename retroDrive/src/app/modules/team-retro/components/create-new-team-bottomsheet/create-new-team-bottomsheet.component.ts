import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { formatDate } from '@angular/common';
import { Workspace } from 'src/app/models/workspace';
import { FirestoreRetroBoardService } from '../../services/firestore-retro-board.service';
import { UserTeamsToSave } from 'src/app/models/userTeamsToSave';
import { CurrentUserApiService } from 'src/app/services/current-user-api.service';

@Component({
  selector: 'app-create-new-team-bottomsheet',
  templateUrl: './create-new-team-bottomsheet.component.html',
  styleUrls: ['./create-new-team-bottomsheet.component.css']
})
export class CreateNewTeamBottomsheetComponent implements OnInit {

  addNewTeamForm: FormGroup;
  teamNameFormControl = new FormControl('');

  constructor(
    private bottomSheetRef: MatBottomSheetRef<CreateNewTeamBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private formBuilder: FormBuilder,
    private firestoreService: FirestoreRetroBoardService,
    private currentUserApiService: CurrentUserApiService) { }

  ngOnInit() {
    this.createNewTeamsForm();
  }

  createNewTeamsForm() {
    this.addNewTeamForm = this.formBuilder.group({
      teamNameFormControl: this.teamNameFormControl,
    });
  }

  createNewTeam() {
    const teamNameValue = this.addNewTeamForm.value.teamNameFormControl;
    const currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');

    const teamToSave = {
      name: teamNameValue,
      creationDate: currentDate,
      workspaceId: this.data.currentWorkspace.id,
      workspace: this.firestoreService.addWorkspaceAsRef(this.data.currentWorkspace.id)
    };

    this.firestoreService.addNewTeam(teamToSave).then(newTeamDocRefSnapshot => {
      newTeamDocRefSnapshot.get().then(newTeamSnapshot => {
        const newTeamId = newTeamSnapshot.id;

        this.firestoreService.getUserTeams(this.data.currentUser.uid).then(userTeamsSnapshot => {
          const isExistngUserTeams = userTeamsSnapshot.docs.length > 0;
          if (isExistngUserTeams) {
            const exisitngUserTeam = userTeamsSnapshot.docs[0].data() as UserTeamsToSave;
            const exisitngUserTeamId = userTeamsSnapshot.docs[0].id;
            exisitngUserTeam.teams.push(this.firestoreService.addTeamAsRef(newTeamId));
            this.firestoreService.updateUserTeams(exisitngUserTeam, exisitngUserTeamId);
          } else {
            const userTeamsToSave: UserTeamsToSave = {
              userId: this.data.currentUser.uid,
              teams: [this.firestoreService.addTeamAsRef(newTeamId)]
            };
            this.firestoreService.addNewUserTeams(userTeamsToSave);
          }

          if (this.currentUserApiService.isTokenExpired()) {
            this.currentUserApiService.regeneraTokenPromise().then(refreshedTokenResponse => {
              this.currentUserApiService.setRegeneratedToken(refreshedTokenResponse);
              this.setUserInTeamInApi(newTeamId);
            });
          } else {
            this.setUserInTeamInApi(newTeamId);
          }
        });
      });
    });
  }

  private setUserInTeamInApi(newTeamId: string) {
    this.currentUserApiService.setUserInTeam(this.data.currentUser.uid, newTeamId, this.data.currentWorkspace.id).then(() => {
      this.bottomSheetRef.dismiss();
    });
  }
}
