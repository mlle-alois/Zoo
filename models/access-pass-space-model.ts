export interface IAccessPassSpaceModelProps {
    passId?: number;
    spaceId?: number;
    numOrderAccess?: number;
}

export class AccessPassSpaceModel implements IAccessPassSpaceModelProps {
    passId?: number;
    spaceId?: number;
    numOrderAccess?: number;

    constructor(props: IAccessPassSpaceModelProps) {
        this.passId = props?.passId;
        this.spaceId= props?.spaceId;
        this.numOrderAccess = props?.numOrderAccess;
        this.numOrderAccess = props?.numOrderAccess;
    }
}