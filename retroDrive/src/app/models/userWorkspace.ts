import { User } from './user';
import { Workspace } from './workspace';

export interface UserWorkspace {
    user: User;
    workspaces: Array<Workspace>;
}
