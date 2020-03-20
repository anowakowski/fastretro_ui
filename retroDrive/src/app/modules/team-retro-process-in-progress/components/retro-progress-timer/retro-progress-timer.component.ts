import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, interval } from 'rxjs';

@Component({
  selector: 'app-retro-progress-timer',
  templateUrl: './retro-progress-timer.component.html',
  styleUrls: ['./retro-progress-timer.component.css']
})
export class RetroProgressTimerComponent implements OnInit, OnDestroy {

  private timerSubscription: any;
  private counter: Observable<number>;
  current = 0;
  max = 10;

  constructor() { }

  ngOnInit() {
    this.setCounter();
    this.subscribeCounterForTimer();
  }

  ngOnDestroy() {
    this.unsubscribeTimer();
  }

  doSomethingWithCurrentValue(progressBarValue) {
    if (progressBarValue === this.max) {
      this.unsubscribeTimer();
    }
  }

  unsubscribeTimer() {
    this.timerSubscription.unsubscribe();
  }

  subscribeCounterForTimer() {
    this.timerSubscription = this.counter.subscribe(sec => {
      this.current++;
    });
  }

  setCounter() {
    const me = this;
    me.counter = interval(1000);
  }
}
