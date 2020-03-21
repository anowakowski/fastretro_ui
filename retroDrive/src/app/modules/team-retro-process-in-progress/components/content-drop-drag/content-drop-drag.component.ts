import { Component, OnInit} from '@angular/core';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board';
import { Column } from 'src/app/models/column';
import { Task } from 'src/app/models/task';

const WENT_WELL = 'Went Well';
const TO_IMPROVE = 'To Improve';

@Component({
  selector: 'app-content-drop-drag',
  templateUrl: './content-drop-drag.component.html',
  styleUrls: ['./content-drop-drag.component.scss']
})
export class ContentDropDragComponent implements OnInit {

  private wnetWellRetroBoardCol = new Column(WENT_WELL, [
    new Task('Get to work', false),
    new Task('Get to work', false),
    new Task('Get to work', false),
    new Task('Get to work', false),
  ]);
  private toImproveRetroBoardCol = new Column(TO_IMPROVE, [
    new Task('Get to work', false),
    new Task('Get to work', false),
    new Task('Get to work', false),
  ]);

  public shouldStopTimer = false;

  board: Board = new Board('Test Board', [
    this.wnetWellRetroBoardCol,
    this.toImproveRetroBoardCol
  ]);

  ngOnInit() {
  }

  addToColumn(colName: string) {
    if (colName === WENT_WELL) {
      this.wnetWellRetroBoardCol.tasks.push(new Task('', true));
    } else if (colName === TO_IMPROVE) {
      this.toImproveRetroBoardCol.tasks.push(new Task('', true));
    }
  }

  stopTimer() {
    this.shouldStopTimer = true;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

}
