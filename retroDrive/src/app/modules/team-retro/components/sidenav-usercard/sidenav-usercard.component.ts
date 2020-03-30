import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-sidenav-usercard',
  templateUrl: './sidenav-usercard.component.html',
  styleUrls: ['./sidenav-usercard.component.css']
})
export class SidenavUsercardComponent implements OnInit {

  mainPhotoUrl = 'https://robohash.org/PC4.png?set=set2';
  currentUser: User;

  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');
  }

}
