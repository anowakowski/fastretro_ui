import { User } from './user';
import { Team } from './team';

export class UsersInTeams {
    userFirebaseDocId: string;
    teamFirebaseDocId: string;
    workspaceFirebaseDocId: string;
    photoURL?: string;
    displayName?: string;
    chosenAvatarUrl: string;
}
