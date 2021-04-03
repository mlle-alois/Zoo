
export interface IAnimalProps {
    id?: number,
    name?: string,
    age?: number,
    speciesId?: number,
    spaceId?: number
}

export class AnimalModel implements IAnimalProps {

    id?: number;
    name?: string;
    age?: number;
    speciesId?: number;
    spaceId?: number

    constructor(props: IAnimalProps) {
        this.id = props.id;
        this.name = props.name;
        this.age = props.age;
        this.speciesId = props.speciesId;
        this.spaceId = props.spaceId;
    }
}