export interface ISpaceTypeProps {
    idSpaceType?: number,
    libelle?: string
}

export class SpaceTypeModel implements  ISpaceTypeProps{
    idSpaceType?: number
    libelle?: string

    constructor(props: ISpaceTypeProps) {
        this.idSpaceType = props?.idSpaceType;
        this.libelle = props?.libelle;
    }
}