/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WelcomeInfoNewUsersDashboardDialogComponent } from './welcome-info-new-users-dashboard-dialog.component';

describe('WelcomeInfoNewUsersDashboardDialogComponent', () => {
  let component: WelcomeInfoNewUsersDashboardDialogComponent;
  let fixture: ComponentFixture<WelcomeInfoNewUsersDashboardDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeInfoNewUsersDashboardDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeInfoNewUsersDashboardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
