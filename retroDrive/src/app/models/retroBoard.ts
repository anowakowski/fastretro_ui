import { Teams } from './teams';
import { Team } from './team';

export interface RetroBoard {
    id: string;
    sprintNumber: string;
    retroName: string;
    team: Team;
    members: any[];
    creationDate: Date;
    isStarted: boolean;
    startDate: Date;
    urlParamId: string;
}