export interface IUsePassUserDateModelProps {
    dateHour?: Date;
    passId?: number;
}

export class UsePassUserDateModel implements IUsePassUserDateModelProps {
    dateHour?: Date;
    passId?: number;

    constructor(props: IUsePassUserDateModelProps) {
        this.dateHour = props?.dateHour;
        this.passId = props?.passId;
    }
}