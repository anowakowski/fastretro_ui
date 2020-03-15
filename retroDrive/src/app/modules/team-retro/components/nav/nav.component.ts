import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  constructor(public auth: AuthService, private router: Router) { }


  @Output() toggleSidenav = new EventEmitter<void>();

  ngOnInit() {
  }

  signOut() {
    this.auth.signOut();

  }

  emitMenu() {
    this.toggleSidenav.emit();
  }

}
