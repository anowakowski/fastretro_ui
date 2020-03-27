import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-team-retro-process-in-progress',
  templateUrl: './team-retro-process-in-progress.component.html',
  styleUrls: ['./team-retro-process-in-progress.component.css']
})
export class TeamRetroProcessInProgressComponent implements OnInit {

  data: any;
  shouldShowContent = false;
  constructor(private route: ActivatedRoute, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    if (this.route.snapshot.data['retroBoardData']) {
      this.data = this.route.snapshot.data['retroBoardData'];
      console.log(this.data);
    }

    this.spinnerTick();
  }

  private spinnerTick() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
      this.shouldShowContent = true;
    }, 2000);
  }
}
