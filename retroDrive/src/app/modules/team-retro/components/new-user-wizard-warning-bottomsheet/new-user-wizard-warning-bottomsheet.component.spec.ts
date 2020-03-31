/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NewUserWizardWarningBottomsheetComponent } from './new-user-wizard-warning-bottomsheet.component';

describe('NewUserWizardWarningBottomsheetComponent', () => {
  let component: NewUserWizardWarningBottomsheetComponent;
  let fixture: ComponentFixture<NewUserWizardWarningBottomsheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewUserWizardWarningBottomsheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUserWizardWarningBottomsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
