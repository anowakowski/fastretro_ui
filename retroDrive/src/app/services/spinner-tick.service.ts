import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerTickService {

  constructor() { }

  public runNewTimer(milSecInterval: number): Observable<number> {
    return interval(milSecInterval);
  }
}
