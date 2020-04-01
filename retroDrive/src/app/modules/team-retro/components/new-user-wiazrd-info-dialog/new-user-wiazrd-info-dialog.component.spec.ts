/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NewUserWiazrdInfoDialogComponent } from './new-user-wiazrd-info-dialog.component';

describe('NewUserWiazrdInfoDialogComponent', () => {
  let component: NewUserWiazrdInfoDialogComponent;
  let fixture: ComponentFixture<NewUserWiazrdInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewUserWiazrdInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUserWiazrdInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
