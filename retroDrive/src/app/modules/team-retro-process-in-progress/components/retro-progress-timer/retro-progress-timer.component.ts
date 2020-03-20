import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, interval } from 'rxjs';

@Component({
  selector: 'app-retro-progress-timer',
  templateUrl: './retro-progress-timer.component.html',
  styleUrls: ['./retro-progress-timer.component.css']
})
export class RetroProgressTimerComponent implements OnInit, OnDestroy {

  private timerMinSubscription: any;
  private timerSecSubscription: any;

  private counterInMin: Observable<number>;
  private counterInSec: Observable<number>;

  currentInMin = 0;
  currentInSec = 0;

  maxInMin = 2;
  minInterval = 60000;
  secInterval = 1000;

  currentMin = 0;
  currentSec = 0;

  constructor() { }

  ngOnInit() {
    this.setCounter();
    this.subscribeCounterForTimer();
  }

  ngOnDestroy() {
    this.unsubscribeTimer();
  }

  doSomethingWithCurrentValue(progressBarValue) {
    if (progressBarValue === this.maxInMin) {
      this.unsubscribeTimer();
    }
  }

  unsubscribeTimer() {
    this.timerMinSubscription.unsubscribe();
  }

  subscribeCounterForTimer() {
    this.timerMinSubscription = this.counterInMin.subscribe(min => {
      this.currentInMin++;
    });
    this.timerMinSubscription = this.counterInSec.subscribe(sec => {
      this.currentInSec++;
    });
  }

  setCounter() {
    this.counterInMin = interval(this.minInterval);
    this.counterInSec = interval(this.secInterval);
  }
}
