// TODO décommenter les champs space une fois le CRUD space mit en place

export interface IAnimalProps {
    id?: number,
    name: string,
    age: number,
    speciesId: number,
    // space: SpaceModel
}

export class AnimalModel implements IAnimalProps {

    id?: number;
    name: string;
    age: number;
    speciesId: number;
    // space: SpaceModel

    constructor(props: IAnimalProps) {
        this.id = props.id;
        this.name = props.name;
        this.age = props.age;
        this.speciesId = props.speciesId;
        // this.space = props.space;
    }
}