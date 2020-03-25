import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

constructor() { }

  private stopRetroInProgressProcessEmiter: EventEmitter<boolean> = new EventEmitter();

  emitStopRetroInProgressProcessEmiter(shouldStopRetroProcess) {
    this.stopRetroInProgressProcessEmiter.emit(shouldStopRetroProcess);
  }

  getStopRetroInProgressProcessEmiter() {
    return this.stopRetroInProgressProcessEmiter;
  }


}

