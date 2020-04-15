import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-add-new-action-bottomsheet',
  templateUrl: './add-new-action-bottomsheet.component.html',
  styleUrls: ['./add-new-action-bottomsheet.component.css']
})
export class AddNewActionBottomsheetComponent implements OnInit {

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddNewActionBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }

  ngOnInit() {
    console.log(this.data);
  }

}
