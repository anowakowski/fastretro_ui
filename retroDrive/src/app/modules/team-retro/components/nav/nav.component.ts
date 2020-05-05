import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { Workspace } from 'src/app/models/workspace';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  constructor(
    public auth: AuthService, private router: Router, private localStorageService: LocalStorageService) { }

  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;

  @Output() toggleSidenav = new EventEmitter<void>();

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');

    if (this.currentUser === undefined) {
      this.auth.signOut();
    } else {
      if (!this.currentUser.isNewUser) {
        this.userWorkspace = this.localStorageService.getItem('userWorkspace');
        this.currentUserWorkspaceName = this.userWorkspace.workspaces.find(x => x.isCurrent).name;
      }
    }
  }

  signOut() {
    this.auth.signOut();

  }

  emitMenu() {
    this.toggleSidenav.emit();
  }

}
