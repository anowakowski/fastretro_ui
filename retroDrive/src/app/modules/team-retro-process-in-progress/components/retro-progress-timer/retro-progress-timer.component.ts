import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable, interval } from 'rxjs';

@Component({
  selector: 'app-retro-progress-timer',
  templateUrl: './retro-progress-timer.component.html',
  styleUrls: ['./retro-progress-timer.component.css']
})
export class RetroProgressTimerComponent implements OnInit, OnDestroy {
  @Input() shouldStopTimer = false;

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

  currentMaxSec = 59;

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

  private unsubscribeTimer() {
    this.timerMinSubscription.unsubscribe();
    this.timerSecSubscription.unsubscribe();
  }

  private subscribeCounterForTimer() {
    this.timerMinSubscription = this.counterInMin.subscribe(min => {
      this.currentCounterMinProgress();
    });
    this.timerSecSubscription = this.counterInSec.subscribe(sec => {
      this.currentCounterSecProgress();
    });
  }

  private currentCounterSecProgress() {
    if (this.shouldStopTimer) {
      this.unsubscribeTimer();
    }

    this.currentInSec++;
    if (this.currentInSec === 60) {
      this.currentInSec = 0;
    }
    this.currentInSecCountDown = this.currentMaxSec - this.currentInSec;
  }

  private currentCounterMinProgress() {
    this.currentInMin++;
    this.currentInMinCountDown = this.currentInMinCountDown - this.currentInMin;
  }

  private setCounter() {
    this.counterInMin = interval(this.minInterval);
    this.counterInSec = interval(this.secInterval);
  }
}
