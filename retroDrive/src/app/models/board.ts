import { Column } from './column';
import { RetroBoard } from './retroBoard';


export class Board {
    constructor(public name: string, public columns: Column[], retroBoardToProces: RetroBoard) {}
}