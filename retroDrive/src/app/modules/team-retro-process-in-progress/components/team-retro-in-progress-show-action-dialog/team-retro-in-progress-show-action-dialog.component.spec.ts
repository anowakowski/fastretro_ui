/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TeamRetroInProgressShowActionDialogComponent } from './team-retro-in-progress-show-action-dialog.component';

describe('TeamRetroInProgressShowActionDialogComponent', () => {
  let component: TeamRetroInProgressShowActionDialogComponent;
  let fixture: ComponentFixture<TeamRetroInProgressShowActionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamRetroInProgressShowActionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamRetroInProgressShowActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
