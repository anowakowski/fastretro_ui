import { Component } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-new-retro-board-bottomsheet',
  templateUrl: './add-new-retro-board-bottomsheet.component.html',
  styleUrls: ['./add-new-retro-board-bottomsheet.component.css']
})
export class AddNewRetroBoardBottomsheetComponent {

  constructor(private _bottomSheetRef: MatBottomSheetRef<AddNewRetroBoardBottomsheetComponent>) { }

  toppings = new FormControl();
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
