import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  constructor(public auth: AuthService, private router: Router, private localStorageService: LocalStorageService) { }

  currentUser: User;

  @Output() toggleSidenav = new EventEmitter<void>();

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');
  }

  signOut() {
    this.auth.signOut();

  }

  emitMenu() {
    this.toggleSidenav.emit();
  }

}
