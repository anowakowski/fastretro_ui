import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, interval } from 'rxjs';

@Component({
  selector: 'app-team-retro-process-in-progress',
  templateUrl: './team-retro-process-in-progress.component.html',
  styleUrls: ['./team-retro-process-in-progress.component.css']
})
export class TeamRetroProcessInProgressComponent implements OnInit, OnDestroy {

  private timerSubscription: any;
  private counter: Observable<number>;
  current = 5;
  max = 10;

  constructor() { }

  ngOnInit() {
    this.setCounter();
  }

  ngOnDestroy() {
    this.unsubscribeTimer();
  }

  doSomethingWithCurrentValue(progressBarValue) {
    if (progressBarValue === this.max) {
      this.unsubscribeTimer();
    }
  }

  unsubscribeTimer () {
    this.timerSubscription.unsubscribe();
  }

  subscribeTimer() {
    this.timerSubscription = this.counter.subscribe(sec => {
      this.current++;
    });
  }

  setCounter() {
    const me = this;
    me.counter = interval(1000);
  }


}
