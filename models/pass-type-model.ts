export interface IPassTypeProps {
    passTypeId: number;
    passTypeName: string;
    passTypePrice: number;
    passTypeIsAvailable: boolean;
}

export class PassTypeModel implements IPassTypeProps {
    passTypeId: number;
    passTypeName: string;
    passTypePrice: number;
    passTypeIsAvailable: boolean;

    constructor(props: IPassTypeProps) {
        this.passTypeId = props.passTypeId;
        this.passTypeName= props.passTypeName;
        this.passTypePrice = props.passTypePrice;
        this.passTypeIsAvailable = props.passTypeIsAvailable;
    }
}