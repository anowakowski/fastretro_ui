import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {

  public shouldChangeRetroDisplayText = false;
  public stopRetroInProgressProcessSubscriptions: any;

  constructor(private eventsServices: EventsService) { }

  ngOnInit() {
    this.subscribeEvents();
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
