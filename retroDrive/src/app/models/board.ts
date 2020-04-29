import { Column } from './column';
import { RetroBoardToSave } from './retroBoardToSave';

export class Board {
    constructor(public name: string, public columns: Column[], retroBoardToProces: RetroBoardToSave) {}
}
