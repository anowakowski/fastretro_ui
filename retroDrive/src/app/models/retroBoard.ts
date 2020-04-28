import { RetroBoardCardActions } from './retroBoardCardActions';

export class RetroBoard {
    id: string;
    sprintNumber: string;
    retroName: string;
    team: any;
    creationDate: Date;
    isStarted: boolean;
    isFinished: boolean;
    startDate: Date;
    urlParamId: string;
    workspaceId: string;
}