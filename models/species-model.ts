export interface ISpeciesProps {
    id?: number,
    name?: string
}

export class SpeciesModel implements  ISpeciesProps{
    id?: number
    name?: string

    constructor(props: ISpeciesProps) {
        this.id = props?.id;
        this.name = props?.name;
    }
}