/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RetroProgressTimerComponent } from './retro-progress-timer.component';

describe('RetroProgressTimerComponent', () => {
  let component: RetroProgressTimerComponent;
  let fixture: ComponentFixture<RetroProgressTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetroProgressTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetroProgressTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
