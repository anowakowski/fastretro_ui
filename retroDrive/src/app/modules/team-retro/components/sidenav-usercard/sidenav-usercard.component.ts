import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidenav-usercard',
  templateUrl: './sidenav-usercard.component.html',
  styleUrls: ['./sidenav-usercard.component.css']
})
export class SidenavUsercardComponent implements OnInit {

  mainPhotoUrl = 'https://robohash.org/PC4.png?set=set2';

  constructor() { }

  ngOnInit() {
  }

}
