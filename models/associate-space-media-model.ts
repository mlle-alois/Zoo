export interface IAssociateSpaceMediaProps {
    media_id: number
    space_id: number

}
export class AssociateSpaceMediaModel implements IAssociateSpaceMediaProps {
    media_id: number
    space_id:number

    constructor(props: IAssociateSpaceMediaProps) {
        this.media_id = props.media_id;
        this.space_id = props.space_id;
    }
}