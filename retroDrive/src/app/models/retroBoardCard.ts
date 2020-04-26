import { MergedRetroBoardCard } from './mergedRetroBoardCard';

export class RetroBoardCard {
    public id: string;
    public name: string;
    public isEdit: boolean;
    public index: number;
    public isClickedFromCloseEdit: boolean;
    public isClickedFromVoteBtn: boolean;
    public isClickedFromMergeBtn: boolean;
    public isClickedFromAddActionBtn: boolean;
    public isClickedFromShowActionBtn: boolean;
    public isNewItem: boolean;
    public isInMerge: boolean;
    public isMerged: boolean;
    public isInAddedToAction: boolean;
    public mergedContent: Array<MergedRetroBoardCard>;
    public isWentWellRetroBoradCol: boolean;
    public retroBoardId: string;
    public userId: string;
    public voteCount: number;
    public actions: Array<any>;
}
