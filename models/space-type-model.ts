export interface ISpaceTypeProps {
    spaceTypeId?: number,
    libelle?: string
}

export class SpaceTypeModel implements  ISpaceTypeProps{
    spaceTypeId?: number
    libelle?: string

    constructor(props: ISpaceTypeProps) {
        this.spaceTypeId = props?.spaceTypeId;
        this.libelle = props?.libelle;
    }
}