import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-team-retro-in-progress-snackbar',
  templateUrl: './team-retro-in-progress-snackbar.component.html',
  styleUrls: ['./team-retro-in-progress-snackbar.component.css']
})
export class TeamRetroInProgressSnackbarComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

  ngOnInit() {
  }

}
