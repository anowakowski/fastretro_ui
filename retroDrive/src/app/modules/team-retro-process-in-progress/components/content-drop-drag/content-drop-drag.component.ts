import { Component, OnInit, Pipe} from '@angular/core';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board';
import { Column } from 'src/app/models/column';
import { Task } from 'src/app/models/task';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

const WENT_WELL = 'Went Well';
const TO_IMPROVE = 'To Improve';
@Component({
  selector: 'app-content-drop-drag',
  templateUrl: './content-drop-drag.component.html',
  styleUrls: ['./content-drop-drag.component.scss']
})
export class ContentDropDragComponent implements OnInit {

  addNewRetroBoardCardForm: FormGroup;
  newCardContentFormControl = new FormControl('', Validators.required);

  constructor(private formBuilder: FormBuilder) {}

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

  ngOnInit() {
    this.createAddNewRetroBoardCardForm();
  }

  createAddNewRetroBoardCardForm() {
    this.addNewRetroBoardCardForm = this.formBuilder.group({
      newCardContentFormControl: this.newCardContentFormControl
    });
  }

  stopTimer() {
    this.shouldStopTimer = true;
  }

  addToColumn(colName: string) {
    if (colName === WENT_WELL) {
      this.wnetWellRetroBoardCol.tasks.push(new Task('', true, 5));
      this.wnetWellRetroBoardCol.tasks.sort((a, b ) => b.index - a.index);

    } else if (colName === TO_IMPROVE) {
      this.toImproveRetroBoardCol.tasks.push(new Task('', true, 5));
      this.toImproveRetroBoardCol.tasks.sort((a, b ) => b.index - a.index);
    }
  }

  addNewTask(card: Task, colName: string) {
    const formValue = this.addNewRetroBoardCardForm.value;
  }

  editCard(card: Task, colName: string) {
    if (card.isClickedFromCloseEdit) {
      const findedTask = this.getTask(card, this.wnetWellRetroBoardCol.tasks);
      const index = this.getArrayIndex(findedTask, this.wnetWellRetroBoardCol.tasks);
      findedTask.isClickedFromCloseEdit = false;
      this.updateTask(index, findedTask, this.wnetWellRetroBoardCol.tasks);
      return;
    }
    if (colName === WENT_WELL) {
      this.processEditTask(card, this.wnetWellRetroBoardCol.tasks);
    } else if (colName === TO_IMPROVE) {
      this.processEditTask(card, this.toImproveRetroBoardCol.tasks);
    }
  }

  closeEditCard(card: Task, colName: string) {
    if (colName === WENT_WELL) {
      this.closeEditTaskProcess(card, this.wnetWellRetroBoardCol.tasks);
    } else if (colName === TO_IMPROVE) {
      this.closeEditTaskProcess(card, this.toImproveRetroBoardCol.tasks);
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

  private processEditTask(card: Task, tasks: Array<Task>) {
    const findedTask = this.getTask(card, tasks);
    const index = this.getArrayIndex(findedTask, tasks);
    findedTask.isNew = true;
    this.updateTask(index, findedTask, tasks);
  }

  private closeEditTaskProcess(card: Task, tasks: Array<Task>) {
    const findedTask = this.getTask(card, tasks);
    const index = this.getArrayIndex(findedTask, tasks);
    findedTask.isNew = false;
    findedTask.isClickedFromCloseEdit = true;
    this.updateTask(index, findedTask, tasks);
  }

  private updateTask(index: number, findedTask: Task, tasks: Array<Task>) {
    tasks[index] = findedTask;
  }

  private getTask(card: Task, tasks: Array<Task>) {
    return tasks.find(x => x.index === card.index);
  }


  private getArrayIndex(findedTask: Task, array: any[]) {
    return array.indexOf(findedTask);
  }
}