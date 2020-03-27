import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerTickService } from 'src/app/services/spinner-tick.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-team-retro',
  templateUrl: './team-retro.component.html',
  styleUrls: ['./team-retro.component.css']
})
export class TeamRetroComponent implements OnInit, OnDestroy {
  constructor(private spinner: NgxSpinnerService, private spinnerTickService: SpinnerTickService) { }


  shouldShowContent = false;
  private spinnerTickSubscription: any;

  ngOnInit() {
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
    this.spinnerTickSubscription = this.spinnerTickService.runNewTimer(5000).subscribe(() => {
      this.spinner.hide();
      this.shouldShowContent = true;
      this.unsubscribeTickService();
    });
  }
}
