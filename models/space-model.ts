export interface ISpaceProps {
    spaceId?: number;
    spaceName?: string;
    spaceDescription?: string;
    spaceCapacity?: number;
    openingTime?: Date;
    closingTime?: Date;
    handicappedAccess?: boolean;
    spaceTypeId?: number;
}

export class SpaceModel implements ISpaceProps {
    spaceId?: number;
    spaceName?: string;
    spaceDescription?: string;
    spaceCapacity?: number;
    openingTime?: Date;
    closingTime?: Date;
    handicappedAccess?: boolean;
    spaceTypeId?: number;

    constructor(props: ISpaceProps) {
        this.spaceId = props?.spaceId;
        this.spaceName = props?.spaceName;
        this.spaceDescription = props?.spaceDescription;
        this.spaceCapacity = props?.spaceCapacity;
        this.openingTime = props?.openingTime;
        this.closingTime = props?.closingTime;
        this.handicappedAccess = props?.handicappedAccess;
        this.spaceTypeId = props?.spaceTypeId;
    }
}