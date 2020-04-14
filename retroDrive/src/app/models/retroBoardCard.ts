import { MergedRetroBoardCard } from './mergedRetroBoardCard';

export class RetroBoardCard {
    public id: string;
    public name: string;
    public isEdit: boolean;
    public index: number;
    public isClickedFromCloseEdit: boolean;
    public isClickedFromVoteBtn: boolean;
    public isClickedFromMergeBtn: boolean;
    public isNewItem: boolean;
    public isInMerge: boolean;
    public isMerged: boolean;
    public mergedContent: Array<MergedRetroBoardCard>;
    public isWentWellRetroBoradCol: boolean;
    public retroBoard: any;
    public user: any;
    public voteCount: number;
}
