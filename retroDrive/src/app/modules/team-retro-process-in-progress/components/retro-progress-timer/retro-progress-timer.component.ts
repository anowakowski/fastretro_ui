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
  currentInMinCountDown = 0;
  currentInSecCountDown = 0;

  maxInMin = 15;
  minInterval = 60000;
  secInterval = 1000;

  constructor() { }

  ngOnInit() {
    this.currentInMinCountDown = this.maxInMin - 1;
    this.currentInSecCountDown = 59;
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
    this.timerSecSubscription.unsubscribe();
  }

  subscribeCounterForTimer() {
    this.timerMinSubscription = this.counterInMin.subscribe(min => {
      this.currentInMin++;

      this.currentInMinCountDown = this.currentInMinCountDown - this.currentInMin;
    });
    this.timerSecSubscription = this.counterInSec.subscribe(sec => {
      this.currentInSec++;

      if (this.currentInSec === 60) {
        this.currentInSec = 0;
      }

      this.currentInSecCountDown = 59 - this.currentInSec;
    });
  }

  setCounter() {
    this.counterInMin = interval(this.minInterval);
    this.counterInSec = interval(this.secInterval);
  }
}
