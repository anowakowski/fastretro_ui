import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerTickService } from 'src/app/services/spinner-tick.service';
import { interval } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-team-retro',
  templateUrl: './team-retro.component.html',
  styleUrls: ['./team-retro.component.css']
})
export class TeamRetroComponent implements OnInit, OnDestroy {
  constructor(
    private spinner: NgxSpinnerService,
    private spinnerTickService: SpinnerTickService,
    private authService: AuthService,
    private localStorageService: LocalStorageService) { }

  shouldShowContent = false;
  private spinnerTickSubscription: any;

  ngOnInit() {
    this.spinnerTick();
    this.setupCurrentUser();
  }

  ngOnDestroy(): void {
    this.unsubscribeTickService();
  }

  private setupCurrentUser() {
    this.authService.user$.subscribe(currentUser => {
      this.localStorageService.setItem('currentUser', currentUser);
    });
  }

  private unsubscribeTickService() {
    this.spinnerTickSubscription.unsubscribe();
  }

  private spinnerTick() {
    this.spinner.show();
    this.spinnerTickSubscription = this.spinnerTickService.runNewTimer(1000).subscribe((interval) => {
      if (interval === 1) {
        this.shouldShowContent = true;
      } else if (interval === 5) {
        this.spinner.hide();
        this.unsubscribeTickService();
      }
    });
  }
}
