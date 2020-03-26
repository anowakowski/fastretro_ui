
export class RetroBoardCard {
    
    constructor(public name: string, public isEdit: boolean, public index: number) {}

    public isClickedFromCloseEdit: boolean;
    public isClickedFromVoteBtn: boolean;
    public isNewItem: boolean;
}