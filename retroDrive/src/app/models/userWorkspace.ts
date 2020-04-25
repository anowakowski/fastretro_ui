import { User } from './user';
import { WorkspaceToSave } from './workspaceToSave';
import { Workspace } from './workspace';

export interface UserWorkspace {
    user: User;
    workspaces: Array<Workspace>;
}
