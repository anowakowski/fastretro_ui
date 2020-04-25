import { Component, OnInit } from '@angular/core';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { WorkspaceToSave } from 'src/app/models/workspaceToSave';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CreateNewTeamBottomsheetComponent } from '../create-new-team-bottomsheet/create-new-team-bottomsheet.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  userWorkspace: UserWorkspace;
  currenUserWorkspace: WorkspaceToSave;

  constructor(private localStorageService: LocalStorageService, private bottomSheetRef: MatBottomSheet) { }

  teams: string[] = ['#Tean1 Alpha', '#Team2 Beta', '#Team3 Gamma'];

  ngOnInit() {
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
    this.prepareTeamsForCurrentWorkspace();
  }

  prepareTeamsForCurrentWorkspace() {
    this.currenUserWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent);
  }

  createNewTeamBottomShet() {
    const bottomSheetRef = this.bottomSheetRef.open(CreateNewTeamBottomsheetComponent, {
      data: 'currentCard'
    });

    bottomSheetRef.afterDismissed().subscribe(() => {
      console.log('Bottom sheet has been dismissed.');
      
    });
  }
}
