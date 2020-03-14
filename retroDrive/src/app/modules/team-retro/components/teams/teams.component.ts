import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  constructor() { }

  teams: string[] = ['#Tean1 Alpha', '#Team2 Beta', '#Team3 Gamma'];

  ngOnInit() {
  }

}
