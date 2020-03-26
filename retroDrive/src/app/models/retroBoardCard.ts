
export class RetroBoardCard {
    
    constructor(public name: string, public isEdit: boolean, public index: number) {}

    public isClickedFromCloseEdit: boolean;
    public isClickedFromLikeBtn: boolean;
    public isNewItem: boolean;
}