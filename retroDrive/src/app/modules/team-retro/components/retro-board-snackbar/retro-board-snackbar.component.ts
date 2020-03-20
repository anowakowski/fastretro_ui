import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-retro-board-snackbar',
  templateUrl: './retro-board-snackbar.component.html',
  styleUrls: ['./retro-board-snackbar.component.css']
})
export class RetroBoardSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
