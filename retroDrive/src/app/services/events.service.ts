import { Injectable, EventEmitter } from '@angular/core';
import { TimerOption } from '../models/timerOption';
import { Workspace } from '../models/workspace';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

constructor() { }

  private stopRetroInProgressProcessEmiter: EventEmitter<boolean> = new EventEmitter();
  private timerOptionsEmiter: EventEmitter<TimerOption> = new EventEmitter();
  private stopTimerEmiter: EventEmitter<boolean> = new EventEmitter();
  private startRetroInProgressProcessEmiter: EventEmitter<boolean> = new EventEmitter();
  private timerIsFinishedEmiter: EventEmitter<void> = new EventEmitter();
  private newTimerSettingEmiter: EventEmitter<string> = new EventEmitter();
  private setTeamsAsDefaultSectionEmiter: EventEmitter<string> = new EventEmitter();
  private setRetroProcessAsDefaultSectionEmiter: EventEmitter<string> = new EventEmitter();
  private setReciveGoOutFromAllRetroBoardListEmiter: EventEmitter<string> = new EventEmitter();
  private setAllRetroBoardBackgroudnMoreHigherEmiter: EventEmitter<string> = new EventEmitter();
  private setAllRetroBoardBackgroudnNoMoreHigherEmiter: EventEmitter<string> = new EventEmitter();
  private setNewCurrentWorkspaceEmiter: EventEmitter<Workspace> = new EventEmitter();
  private setAllRetroBoardAsDefaultSectionEmiter: EventEmitter<string> = new EventEmitter();
  private setRefreshNotificationEmiter: EventEmitter<void> = new EventEmitter();

  emitStopRetroInProgressProcessEmiter(shouldStopRetroProcess) {
    this.stopRetroInProgressProcessEmiter.emit(shouldStopRetroProcess);
  }

  getStopRetroInProgressProcessEmiter() {
    return this.stopRetroInProgressProcessEmiter;
  }

  emitTimerOptions(timerOption: TimerOption) {
    this.timerOptionsEmiter.emit(timerOption);
  }

  getTimerOptionsEmiter() {
    return this.timerOptionsEmiter;
  }

  emitStopTimer(shouldStopTimer) {
    this.stopTimerEmiter.emit(shouldStopTimer);
  }

  getStopTimerEmiter() {
    return this.stopTimerEmiter;
  }

  emitStartRetroInProgressProcessEmiter(shouldStartRetroProcess) {
    this.startRetroInProgressProcessEmiter.emit(shouldStartRetroProcess);
  }

  getStartRetroInProgressProcessEmiter() {
    return this.startRetroInProgressProcessEmiter;
  }

  emitTimerIsFinished() {
    this.timerIsFinishedEmiter.emit();
  }

  getTimerIsFinishedEmiter() {
    return this.timerIsFinishedEmiter;
  }

  emitNewTimerSetting(newTimerSettingId) {
    this.newTimerSettingEmiter.emit(newTimerSettingId);
  }

  getNewTimerSettingEmiter() {
    return this.newTimerSettingEmiter;
  }

  emitSetTeamsAsDefaultSection() {
    this.setTeamsAsDefaultSectionEmiter.emit();
  }

  getSetTeamsAsDefaultSectionEmiter() {
    return this.setTeamsAsDefaultSectionEmiter;
  }

  emitSetRetroProcessAsDefaultSectionEmiter() {
    this.setRetroProcessAsDefaultSectionEmiter.emit();
  }

  getSetRetroProcessAsDefaultSectionEmiter() {
    return this.setRetroProcessAsDefaultSectionEmiter;
  }

  emitSetReciveGoOutFromAllRetroBoardListEmiter() {
    this.setReciveGoOutFromAllRetroBoardListEmiter.emit();
  }

  getSetReciveGoOutFromAllRetroBoardListEmiter() {
    return this.setReciveGoOutFromAllRetroBoardListEmiter;
  }

  emitSetAllRetroBoardBackgroudnMoreHigherEmiter() {
    this.setAllRetroBoardBackgroudnMoreHigherEmiter.emit();
  }

  getSetAllRetroBoardBackgroudnMoreHigherEmiter() {
    return this.setAllRetroBoardBackgroudnMoreHigherEmiter;
  }

  emitSetAllRetroBoardBackgroudnNoMoreHigherEmiter() {
    this.setAllRetroBoardBackgroudnNoMoreHigherEmiter.emit();
  }

  getSetAllRetroBoardBackgroudnNoMoreHigherEmiter() {
    return this.setAllRetroBoardBackgroudnNoMoreHigherEmiter;
  }

  emitSetNewCurrentWorkspaceEmiter(currentWorkspace: Workspace) {
    this.setNewCurrentWorkspaceEmiter.emit(currentWorkspace);
  }

  getSetNewCurrentWorkspaceEmiterEmiter() {
    return this.setNewCurrentWorkspaceEmiter;
  }

  emitSetAllRetroBoardAsDefaultSectionEmiter() {
    this.setAllRetroBoardAsDefaultSectionEmiter.emit();
  }

  getSetAllRetroBoardAsDefaultSectionEmiter() {
    return this.setAllRetroBoardAsDefaultSectionEmiter;
  }


  emitSetRefreshNotificationEmiter() {
    this.setRefreshNotificationEmiter.emit();
  }

  getsetRefreshNotificationEmiter() {
    return this.setRefreshNotificationEmiter;
  }
}

