import { User } from './user';
import { WorkspaceToSave } from './workspaceToSave';

export interface UserWorkspace {
    user: User;
    workspaces: Array<WorkspaceToSave>;
}
