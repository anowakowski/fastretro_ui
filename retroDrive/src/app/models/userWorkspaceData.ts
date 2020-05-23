import { User } from './user';
import { Workspace } from './workspace';

export interface UserWorkspaceData {
    workspace: Workspace;
    isCurrent: boolean;
}
