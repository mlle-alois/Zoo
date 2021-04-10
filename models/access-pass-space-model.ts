export interface IAccessPassSpaceModelProps {
    passTypeId: number;
    spaceId: number;
    numOrderAccess: number;
}

export class AccessPassSpaceModel implements IAccessPassSpaceModelProps {
    passTypeId: number;
    spaceId: number;
    numOrderAccess: number;

    constructor(props: IAccessPassSpaceModelProps) {
        this.passTypeId = props.passTypeId;
        this.spaceId= props.spaceId;
        this.numOrderAccess = props.numOrderAccess;
    }
}