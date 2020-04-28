import { Teams } from './teams';
import { Team } from './team';

export interface RetroBoardToSave {
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
