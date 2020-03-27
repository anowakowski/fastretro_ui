import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from 'src/app/services/local-storage.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thrFormGroup: FormGroup;


  avatar1MainPhotoUrl = 'https://robohash.org/PC1.png?set=set2';
  avatar2MainPhotoUrl = 'https://robohash.org/PC2.png?set=set2';
  avatar3MainPhotoUrl = 'https://robohash.org/PC3.png?set=set2';
  avatar4MainPhotoUrl = 'https://robohash.org/PC4.png?set=set2';
  avatar5MainPhotoUrl = 'https://robohash.org/PC5.png?set=set2';

  constructor(
    private spinner: NgxSpinnerService,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }
  checked = false;
  currentUser: User;

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['Negative'], ['Positive'], ''];
  public pieChartData: SingleDataSet = [7, 5, 0];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];

  public firstTimeLoadElementForSpinner = true;

  ngOnInit() {
    this.currentUser = this.localStorageService.getItem('currentUser');

    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thrFormGroup = this.formBuilder.group({
      thrCtrl: ['', Validators.required]
    });
  }
}
