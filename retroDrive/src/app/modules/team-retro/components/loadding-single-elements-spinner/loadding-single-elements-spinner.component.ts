import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loadding-single-elements-spinner',
  templateUrl: './loadding-single-elements-spinner.component.html',
  styleUrls: ['./loadding-single-elements-spinner.component.css']
})
export class LoaddingSingleElementsSpinnerComponent implements OnInit {

  constructor() { }

  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 50;

  ngOnInit() {
  }

}
