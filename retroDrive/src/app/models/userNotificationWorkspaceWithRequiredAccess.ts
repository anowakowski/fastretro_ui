import { UserNotification } from './userNotification';
import { UserWaitingToApproveWorkspaceJoin } from './userWaitingToApproveWorkspaceJoin';

export class UserNotificationWorkspaceWithRequiredAccess {
    public userWantToJoinFirebaseId: string;
    public creatorUserFirebaseId: string;
    public workspceWithRequiredAccessFirebaseId: string;
    public email: string;
    public displayName: string;
    public workspaceName: string;
    public userWaitingToApproveWorkspaceJoinId: number;
    public userWaitingToApproveWorkspaceJoin: UserWaitingToApproveWorkspaceJoin;
    public userNotification: UserNotification;
}
