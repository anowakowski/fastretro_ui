import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable, interval } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';
import { TimerOption } from 'src/app/models/timerOption';

@Component({
  selector: 'app-retro-progress-timer',
  templateUrl: './retro-progress-timer.component.html',
  styleUrls: ['./retro-progress-timer.component.css']
})
export class RetroProgressTimerComponent implements OnInit, OnDestroy {
  @Input() shouldStopTimer = false;
  @Input() shouldHideSmallTimer = false;
  @Input() shouldHideBigTimer = false;

  public stopRetroInProgressProcessSubscriptions: any;
  public timerOptionsSubscriptions: any;

  private timerMinSubscription: any;
  private timerSecSubscription: any;

  private counterInMin: Observable<number>;
  private counterInSec: Observable<number>;

  currentInMin = 0;
  currentInSec = 0;
  currentInMinCountDown = 0;
  currentInSecCountDown = 0;

  maxInMin = 3;
  minInterval = 60000;
  secInterval = 1000;

  currentMaxSec = 59;

  shouldHideCounterAfterStopTimer = false;
  shouldMonitortheLastCountDounInSec = false;
  timerIsStopped = false;

  constructor(private eventsServices: EventsService) { }

  ngOnInit() {
    this.currentInMinCountDown = this.maxInMin - 1;
    this.currentInSecCountDown = 59;
    this.setCounter();
    this.subscribeCounterForTimer();
    this.subscribeEvents();
  }

  ngOnDestroy() {
    this.unsubscribeTimer();
    this.stopRetroInProgressProcessSubscriptions.unsubscribe();
  }

  doSomethingWithCurrentValue(progressBarValue) {
    if (progressBarValue === this.maxInMin) {
      this.shouldMonitortheLastCountDounInSec = true;
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
    this.currentInSec++;
    if (this.currentInSec === 60) {
      this.currentInSec = 0;
    }
    this.currentInSecCountDown = this.currentMaxSec - this.currentInSec;

    if (this.shouldMonitortheLastCountDounInSec) {
      if (this.currentInSec === this.currentMaxSec) {
        this.stopRetroTimer();

        this.eventsServices.emitStopRetroInProgressProcessEmiter(true);
      }
    }
  }

  private currentCounterMinProgress() {
    this.currentInMin++;
    const localMaxInMin = this.maxInMin - 1;
    this.currentInMinCountDown = localMaxInMin - this.currentInMin;
  }

  private setCounter() {
    this.counterInMin = interval(this.minInterval);
    this.counterInSec = interval(this.secInterval);
  }

  private stopRetroTimer() {
    this.shouldHideCounterAfterStopTimer = true;
    this.timerIsStopped = true;
    this.currentInMin = this.maxInMin;
    this.unsubscribeTimer();
  }

  private setNewTimer(timerOption: TimerOption) {
    console.log(timerOption);

    this.shouldHideCounterAfterStopTimer = false;
    this.timerIsStopped = false;

    this.maxInMin = timerOption.value as number;
    this.currentInMin = 0;

    this.currentInMinCountDown = this.maxInMin - 1;
    this.currentInSecCountDown = 59;

    this.subscribeCounterForTimer();
  }

  private subscribeEvents() {
    this.stopRetroInProgressProcessSubscriptions =
      this.eventsServices.getStopRetroInProgressProcessEmiter().subscribe(shouldStopRetroProcess => {
      if (shouldStopRetroProcess && !this.timerIsStopped) {
        this.stopRetroTimer();
      }
    });
    this.timerOptionsSubscriptions = this.eventsServices.getTimerOptionsEmiter().subscribe(timerOptions => {
      this.setNewTimer(timerOptions);
    });
  }
}
