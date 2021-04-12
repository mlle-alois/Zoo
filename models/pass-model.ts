export interface IPassProps {
    passId: number;
    dateHourPurchase?: Date;
    dateHourPeremption?: Date;
    passTypeId?: number;
    userId?: number;
}

export class PassModel implements IPassProps {
    passId: number;
    dateHourPurchase?: Date;
    dateHourPeremption?: Date;
    passTypeId?: number;
    userId?: number;

    constructor(props: IPassProps) {
        this.passId = props.passId;
        this.dateHourPurchase = props?.dateHourPurchase;
        this.dateHourPeremption = props?.dateHourPeremption;
        this.passTypeId = props?.passTypeId;
        this.userId = props?.userId;
    }
}