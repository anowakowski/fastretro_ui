import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {

  mediaSub: Subscription;
  devicesXs: boolean;
  devicesSm: boolean;
  devicesMd: boolean;
  devicesLg: boolean;
  devicesXl: boolean;

  constructor(public auth: AuthService, public mediaObserver: MediaObserver) { }

  ngOnInit() {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.devicesXs = result.mqAlias === 'xs' ? true : false;
      this.devicesSm = result.mqAlias === 'sm' ? true : false;
      this.devicesMd = result.mqAlias === 'md' ? true : false;
      this.devicesLg = result.mqAlias === 'lg' ? true : false;
      this.devicesXl = result.mqAlias === 'xl' ? true : false;
    });
  }

  ngOnDestroy(): void {
    this.mediaSub.unsubscribe();
  }
}
