/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TeamRetroInProgressAddCardActionDialogComponent } from './team-retro-in-progress-add-card-action-dialog.component';

describe('TeamRetroInProgressAddCardActionDialogComponent', () => {
  let component: TeamRetroInProgressAddCardActionDialogComponent;
  let fixture: ComponentFixture<TeamRetroInProgressAddCardActionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamRetroInProgressAddCardActionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamRetroInProgressAddCardActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
