import { Component, OnInit, Pipe} from '@angular/core';
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

  constructor() {}
  
  private wnetWellRetroBoardCol = new Column(WENT_WELL, [
    new Task('Get to work', false, 1),
    new Task('Get to work', false, 2),
    new Task('Get to work', false, 3),
    new Task('Get to work', false, 4),
  ]);
  private toImproveRetroBoardCol = new Column(TO_IMPROVE, [
    new Task('Get to work', false, 1),
    new Task('Get to work', false, 2),
    new Task('Get to work', false, 3),
  ]);

  public shouldStopTimer = false;

  board: Board = new Board('Test Board', [
    this.wnetWellRetroBoardCol,
    this.toImproveRetroBoardCol
  ]);

  ngOnInit() {}

  addToColumn(colName: string) {
    if (colName === WENT_WELL) {
      this.wnetWellRetroBoardCol.tasks.push(new Task('', true, 5));
      this.wnetWellRetroBoardCol.tasks.sort((a, b ) => b.index - a.index);

    } else if (colName === TO_IMPROVE) {
      this.toImproveRetroBoardCol.tasks.push(new Task('', true, 5));
      this.toImproveRetroBoardCol.tasks.sort((a, b ) => b.index - a.index);
    }
  }

  stopTimer() {
    this.shouldStopTimer = true;
  }

  editCard(card: Task, colName: string) {
    if (card.isClickedFromCloseEdit){
      const findedTask = this.wnetWellRetroBoardCol.tasks.find(x => x.index === card.index);
      const index = this.wnetWellRetroBoardCol.tasks.indexOf(findedTask);
//      findedTask.isNew = true;

      findedTask.isClickedFromCloseEdit = false;

      this.wnetWellRetroBoardCol.tasks[index] = findedTask;

      return;
    }
    if (colName === WENT_WELL) {
      const findedTask = this.wnetWellRetroBoardCol.tasks.find(x => x.index === card.index);
      const index = this.wnetWellRetroBoardCol.tasks.indexOf(findedTask);
//      findedTask.isNew = true;

      findedTask.isNew = true;

      this.wnetWellRetroBoardCol.tasks[index] = findedTask;

    }
  }

  closeEditCard(card: Task, colName: string) {
    if (colName === WENT_WELL) {
      const findedTask = this.wnetWellRetroBoardCol.tasks.find(x => x.index === card.index);
      const index = this.wnetWellRetroBoardCol.tasks.indexOf(findedTask);
      findedTask.isNew = false;
      findedTask.isClickedFromCloseEdit = true;
      this.wnetWellRetroBoardCol.tasks[index] = findedTask;
    }
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