import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-team-retro',
  templateUrl: './team-retro.component.html',
  styleUrls: ['./team-retro.component.css']
})
export class TeamRetroComponent implements OnInit {
  constructor(private spinner: NgxSpinnerService) {}

  ngOnInit() {
        /** spinner starts on init */
        this.spinner.show();
 
        setTimeout(() => {
          /** spinner ends after 5 seconds */
          this.spinner.hide();
        }, 5000);
  }
}
