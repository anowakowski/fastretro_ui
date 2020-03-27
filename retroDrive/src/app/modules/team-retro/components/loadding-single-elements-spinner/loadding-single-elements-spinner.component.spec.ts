/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LoaddingSingleElementsSpinnerComponent } from './loadding-single-elements-spinner.component';

describe('LoaddingSingleElementsSpinnerComponent', () => {
  let component: LoaddingSingleElementsSpinnerComponent;
  let fixture: ComponentFixture<LoaddingSingleElementsSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoaddingSingleElementsSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaddingSingleElementsSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
