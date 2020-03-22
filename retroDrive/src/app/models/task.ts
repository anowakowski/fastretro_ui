
export class Task {
    
    constructor(public name: string, public isNew: boolean, public index: number) {}

    public isClickedFromCloseEdit: boolean;
}