import { UserNotification } from './userNotification';

export class UserNotificationWorkspaceWithRequiredAccess {
    public userWantToJoinFirebaseId: string;
    public creatorUserFirebaseId: string;
    public workspceWithRequiredAccessFirebaseId: string;
    public email: string;
    public displayName: string;
    public workspaceName: string;
    public userNotification: UserNotification;
}
