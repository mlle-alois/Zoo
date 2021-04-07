export interface IBuyPassUserDateModelProps {
    userId?: number;
    dateHour?: Date;
    passId?: number;
    peremptionDateHour?: Date;
}

export class BuyPassUserDateModel implements IBuyPassUserDateModelProps {
    userId?: number;
    dateHour?: Date;
    passId?: number;
    peremptionDateHour?: Date;

    constructor(props: IBuyPassUserDateModelProps) {
        this.userId = props?.userId;
        this.dateHour = props?.dateHour;
        this.passId = props?.passId;
        this.peremptionDateHour = props?.peremptionDateHour;
    }
}