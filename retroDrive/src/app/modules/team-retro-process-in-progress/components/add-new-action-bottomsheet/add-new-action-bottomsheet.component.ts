import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { RetroBoardCard } from 'src/app/models/retroBoardCard';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-add-new-action-bottomsheet',
  templateUrl: './add-new-action-bottomsheet.component.html',
  styleUrls: ['./add-new-action-bottomsheet.component.css']
})
export class AddNewActionBottomsheetComponent implements OnInit {

  addNewActionForRetroBoardCardForm: FormGroup;
  actionTextAreaFormControl = new FormControl('');

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddNewActionBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private formBuilder: FormBuilder) { }

  currentCard: RetroBoardCard;

  ngOnInit() {
    this.currentCard = this.data as RetroBoardCard;
    this.createActionForRetroBoardForm();
  }

  createActionForRetroBoardForm() {
    this.addNewActionForRetroBoardCardForm = this.formBuilder.group({
      actionTextAreaFormControl: this.actionTextAreaFormControl,
    });
  }

  createNewRetroBoardCardAction() {
    
  }

}
