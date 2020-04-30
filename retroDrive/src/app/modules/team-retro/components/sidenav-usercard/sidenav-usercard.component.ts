import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidenav-usercard',
  templateUrl: './sidenav-usercard.component.html',
  styleUrls: ['./sidenav-usercard.component.css']
})
export class SidenavUsercardComponent implements OnInit {

  mainPhotoUrl = 'https://robohash.org/PC4.png?set=set2';
  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;

  constructor(
    private localStorageService: LocalStorageService,
    private authService: AuthService) { }

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');

    if (this.currentUser === undefined) {
      this.authService.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getItem('userWorkspace');
        const currentWorkspace = this.userWorkspace.workspaces.find(uw => uw.isCurrent);
        this.currentUserWorkspaceName = currentWorkspace.name;
      }
    }
  }

}
