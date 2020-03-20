import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-retro-process-in-progress',
  templateUrl: './team-retro-process-in-progress.component.html',
  styleUrls: ['./team-retro-process-in-progress.component.css']
})
export class TeamRetroProcessInProgressComponent implements OnInit {

  current = 5;
  max = 10;

  constructor() { }

  ngOnInit() {
  }

  doSomethingWithCurrentValue(progressBarValue){
    const me = this;
    if (progressBarValue === me.max) {
      //me.ngOnDestroy();
    }
  }


}
