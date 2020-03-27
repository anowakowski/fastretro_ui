import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerTickService } from 'src/app/services/spinner-tick.service';

@Component({
  selector: 'app-team-retro-process-in-progress',
  templateUrl: './team-retro-process-in-progress.component.html',
  styleUrls: ['./team-retro-process-in-progress.component.css']
})
export class TeamRetroProcessInProgressComponent implements OnInit, OnDestroy {

  data: any;
  shouldShowContent = false;
  private spinnerTickSubscription: any;
  constructor(private route: ActivatedRoute, private spinner: NgxSpinnerService, private spinnerTickService: SpinnerTickService) { }

  ngOnInit() {
    if (this.route.snapshot.data['retroBoardData']) {
      this.data = this.route.snapshot.data['retroBoardData'];
      console.log(this.data);
    }

    this.spinnerTick();
  }

  ngOnDestroy(): void {
    this.unsubscribeTickService();
  }

  private unsubscribeTickService() {
    this.spinnerTickSubscription.unsubscribe();
  }

  private spinnerTick() {
    this.spinner.show();
    this.spinnerTickSubscription = this.spinnerTickService.runNewTimer(1000).subscribe((interval) => {
      if (interval === 1) {
        this.shouldShowContent = true;
      } else if (interval === 2) {
        this.spinner.hide();
        this.unsubscribeTickService();
      }
    });
  }
}
