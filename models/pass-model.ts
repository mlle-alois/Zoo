export interface IPassProps {
    passId?: number;
    passName?: string;
    price?: number;
    isAvailable?: boolean;
}

export class PassModel implements IPassProps {
    passId?: number;
    passName?: string;
    price?: number;
    isAvailable?: boolean;

    constructor(props: IPassProps) {
        this.passId = props?.passId;
        this.passName= props?.passName;
        this.price = props?.price;
        this.isAvailable = props?.isAvailable;
    }
}