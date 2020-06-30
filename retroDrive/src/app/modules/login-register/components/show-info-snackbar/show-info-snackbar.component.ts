import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-show-info-snackbar',
  templateUrl: './show-info-snackbar.component.html',
  styleUrls: ['./show-info-snackbar.component.css']
})
export class ShowInfoSnackbarComponent implements OnInit {
  public userNotExistsErrorMessage = 'User with given email not exist';
  public userIsCurrentlyExistingErrorMessage = 'User with given email is currently exist';

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

  ngOnInit() {
  }
}
