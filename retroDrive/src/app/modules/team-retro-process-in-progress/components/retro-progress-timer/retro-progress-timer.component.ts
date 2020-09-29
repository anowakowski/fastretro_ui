import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable, interval } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';
import { TimerOption } from 'src/app/models/timerOption';
import { FiresrtoreRetroProcessInProgressService } from '../../services/firesrtore-retro-process-in-progress.service';
import { TimerSettingToSave } from 'src/app/models/timerSettingToSave';
import { formatDate } from '@angular/common';

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
  public stopTimerSubscriptions: any;
  public timerOptionsSubscriptions: any;
  public startRetroInProgressProcessSubscriptions: any;
  public newTimerSettingsSubscriptions: any;

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
  retroProcessIsStop = false;
  shouldShowStartTimerIcon: boolean;
  currentTimerSettingId: any;

  maxValueToMinitor: number;
  timerIsInConfigurationMode: boolean;

  constructor(private eventsServices: EventsService, private firebaseService: FiresrtoreRetroProcessInProgressService) { }

  ngOnInit() {
    this.currentInMinCountDown = this.maxInMin - 1;
    this.currentInSecCountDown = 59;
    this.setCounter();
    this.subscribeEvents();
    this.shouldHideCounterAfterStopTimer = true;
    this.shouldShowStartTimerIcon = true;
  }

  ngOnDestroy() {
    this.unsubscribeEvents();
  }

  doSomethingWithCurrentValue(progressBarValue) {
    if (progressBarValue === this.maxValueToMinitor) {
      this.shouldMonitortheLastCountDounInSec = true;
    }
  }

  private unsubscribeTimer() {
    if (this.timerMinSubscription !== undefined) {
      this.timerMinSubscription.unsubscribe();
    }
    if (this.timerSecSubscription !== undefined) {
      this.timerSecSubscription.unsubscribe();
    }
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

        this.eventsServices.emitTimerIsFinished();
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
    this.currentInSec = 0;
    this.unsubscribeTimer();

    const timerSettingToUpdate = { chosenTimerOpt: {}, isStarted: false };
    this.firebaseService.updateCurrentTimerSettings(timerSettingToUpdate, this.currentTimerSettingId);
    this.eventsServices.emitTimerIsFinished();
  }

  private setNewTimer(timerOption: TimerOption) {

    this.shouldHideCounterAfterStopTimer = false;
    this.timerIsStopped = false;

    this.maxInMin = timerOption.value as number;
    this.currentInMin = 0;

    this.currentInMinCountDown = this.maxInMin - 1;
    this.currentInSecCountDown = 59;

    this.maxValueToMinitor = this.maxInMin - 1;

    this.subscribeCounterForTimer();
  }

  private subscribeEvents() {
    this.subscribeStopRetroProcess();

    this.stopTimerSubscriptions = this.eventsServices.getStopTimerEmiter().subscribe(shouldStopTimer => {
      if (shouldStopTimer && !this.timerIsStopped) {
        this.stopRetroTimer();
        if (!this.retroProcessIsStop) {
          this.shouldShowStartTimerIcon = true;
        }
      }
    });

    this.newTimerSettingsSubscriptions = this.eventsServices.getNewTimerSettingEmiter().subscribe(newTimerSettingId => {
      this.currentTimerSettingId = newTimerSettingId;
      this.timerOptionsSubscriptions =
      this.firebaseService.getFilteredTimerSettingByIdSnapshotChanges(newTimerSettingId)
        .subscribe(timerSettingsSnapshot => {
          const timerSetting = timerSettingsSnapshot.payload.data() as TimerSettingToSave;
          const chosenTimerOption = timerSetting.chosenTimerOpt;
          this.timerIsInConfigurationMode = timerSetting.isStarted;

          if (chosenTimerOption.value !== undefined &&
              timerSetting.isStarted &&
              this.isFreshTimmer(timerSetting)) {
                this.clearTimerBeforeStardNewOneFromNewTimerSettings();
                this.setNewTimer(chosenTimerOption);
                this.shouldShowStartTimerIcon = false;
                this.eventsServices.emitTimmerIsRunningForBottomNavbarBtn();
          } else if (!timerSetting.isStarted && !this.timerIsStopped) {
            this.stopRetroTimer();
            if (!this.retroProcessIsStop) {
              this.shouldShowStartTimerIcon = true;
            }
          }
        });
    });

    this.startRetroInProgressProcessSubscriptions =
      this.eventsServices.getStartRetroInProgressProcessEmiter().subscribe(shouldStartRetroProcess => {
        this.shouldShowStartTimerIcon = true;
        this.retroProcessIsStop = false;

        this.subscribeStopRetroProcess();
    });
  }

  private clearTimerBeforeStardNewOneFromNewTimerSettings() {
    this.currentInMin = this.maxInMin;
    this.currentInSec = 0;
    this.unsubscribeTimer();
  }

  private isFreshTimmer(timerSetting: TimerSettingToSave): boolean {
    const maxOfFreshValueInSecond = 15;
    const currentDateStr = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en');
    const dateOfUpdateTimerSettings = new Date(timerSetting.updateDate);
    const currentDate = new Date(currentDateStr);
    const datesDiffInSeconds = (currentDate.getTime() - dateOfUpdateTimerSettings.getTime()) / 1000;

    return datesDiffInSeconds < maxOfFreshValueInSecond;
  }

  private subscribeStopRetroProcess() {
    this.stopRetroInProgressProcessSubscriptions =
      this.eventsServices.getStopRetroInProgressProcessEmiter().subscribe(shouldStopRetroProcess => {
        this.shouldShowStartTimerIcon = false;
        this.retroProcessIsStop = true;
        if (shouldStopRetroProcess && !this.timerIsStopped) {
          this.stopRetroTimer();
        }
      });
  }

  private unsubscribeEvents() {
    this.unsubscribeTimer();
    if (this.stopRetroInProgressProcessSubscriptions !== undefined) {
      this.stopRetroInProgressProcessSubscriptions.unsubscribe();
    }
    if (this.stopTimerSubscriptions !== undefined) {
      this.stopTimerSubscriptions.unsubscribe();
    }
    if (this.timerOptionsSubscriptions !== undefined) {
      this.timerOptionsSubscriptions.unsubscribe();
    }
  }

}
