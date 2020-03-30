import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-user-wiazrd-info-dialog',
  templateUrl: './new-user-wiazrd-info-dialog.component.html',
  styleUrls: ['./new-user-wiazrd-info-dialog.component.css']
})
export class NewUserWiazrdInfoDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NewUserWiazrdInfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public displayInfo: string[]) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
