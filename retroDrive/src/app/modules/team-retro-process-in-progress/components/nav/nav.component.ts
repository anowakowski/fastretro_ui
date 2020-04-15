import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';

import { User } from 'src/app/models/user';
import { UserWorkspace } from 'src/app/models/userWorkspace';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {

  public shouldChangeRetroDisplayText = false;
  public stopRetroInProgressProcessSubscriptions: any;

  currentUser: User;
  public userWorkspace: UserWorkspace;
  public currentUserWorkspaceName: string;

  constructor(private eventsServices: EventsService, private localStorageService: LocalStorageService) { }

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

  private subscribeEvents() {
    this.stopRetroInProgressProcessSubscriptions =
      this.eventsServices.getStopRetroInProgressProcessEmiter().subscribe(shouldStopRetroProcess => {
      if (shouldStopRetroProcess) {
        this.shouldChangeRetroDisplayText = true;
      }
    });
  }
}
