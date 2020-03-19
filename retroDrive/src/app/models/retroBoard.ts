import { Teams } from './teams';

export interface RetroBoard {
    id: string;
    sprintNumber: string;
    retroName: string;
    team: Teams;
    members: any[];
    creationDate: Date;
    isStarted: boolean;
    startDate: Date;
}