import { User } from './user';
import { Workspace } from './workspace';

export interface UserWorkspace {
    id: string;
    user: User;
    workspaces: Array<any>;
}
