/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TeamRetroInProgressSetTimeDialogComponent } from './team-retro-in-progress-set-time-dialog.component';

describe('TeamRetroInProgressSetTimeDialogComponent', () => {
  let component: TeamRetroInProgressSetTimeDialogComponent;
  let fixture: ComponentFixture<TeamRetroInProgressSetTimeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamRetroInProgressSetTimeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamRetroInProgressSetTimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
