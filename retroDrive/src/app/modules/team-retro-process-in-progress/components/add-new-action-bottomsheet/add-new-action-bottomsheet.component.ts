import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';

@Component({
  selector: 'app-add-new-action-bottomsheet',
  templateUrl: './add-new-action-bottomsheet.component.html',
  styleUrls: ['./add-new-action-bottomsheet.component.css']
})
export class AddNewActionBottomsheetComponent implements OnInit {

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddNewActionBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }

  currentCard: RetroBoardCard;

  ngOnInit() {
    this.currentCard = this.data as RetroBoardCard;
  }

}
