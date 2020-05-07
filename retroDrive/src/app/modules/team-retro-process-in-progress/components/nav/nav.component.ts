import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';

import { User } from 'src/app/models/user';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {

  public shouldChangeRetroDisplayText = false;
  public stopRetroInProgressProcessSubscriptions: any;
  public startRetroInProgressProcessSubscriptions: any;


  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;

  constructor(private eventsServices: EventsService, private localStorageService: LocalStorageService, private router: Router) { }

  ngOnInit() {
    this.subscribeEvents();

    this.currentUser = this.localStorageService.getItem('currentUser');
    this.userWorkspace = this.localStorageService.getItem('userWorkspace');
    this.currentUserWorkspaceName = this.userWorkspace.workspaces[0].name;
  }

  ngOnDestroy() {
    this.stopRetroInProgressProcessSubscriptions.unsubscribe();
  }

  stopTimer() {
    this.shouldChangeRetroDisplayText = true;
  }

  backToDashboard() {
    this.router.navigate(['/']);
  }

  private subscribeEvents() {
    this.stopRetroInProgressProcessSubscriptions =
      this.eventsServices.getStopRetroInProgressProcessEmiter().subscribe(shouldStopRetroProcess => {
      if (shouldStopRetroProcess) {
        this.shouldChangeRetroDisplayText = shouldStopRetroProcess;
      }
    });

    this.startRetroInProgressProcessSubscriptions =
      this.eventsServices.getStartRetroInProgressProcessEmiter().subscribe(shouldStartRetroProcess => {
      if (shouldStartRetroProcess) {
        this.shouldChangeRetroDisplayText = false;
      }
    });
  }
}
