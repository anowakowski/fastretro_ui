import { User } from './user';
import { Workspace } from './workspace';
import { UserWorkspaceData } from './userWorkspaceData';

export interface UserWorkspace {
    id: string;
    user: User;
    workspaces: Array<UserWorkspaceData>;
}
