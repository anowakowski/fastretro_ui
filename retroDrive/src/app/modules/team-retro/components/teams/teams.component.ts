import { Component, OnInit } from '@angular/core';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  userWorkspace: UserWorkspace;

  constructor(private localStorageService: LocalStorageService) { }

  teams: string[] = ['#Tean1 Alpha', '#Team2 Beta', '#Team3 Gamma'];

  ngOnInit() {
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
  }

  prepareTeamsForCurrentWorkspace() {
    

  }

}
