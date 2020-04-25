import { User } from './user';
import { Team } from './team';

export class UserTeams {
    id: string;
    user: User;
    teams: Team[];
}
