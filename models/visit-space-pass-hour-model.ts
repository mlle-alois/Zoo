export interface IVisitSpacePassHourModelProps {
    pass_id: number,
    date_hour_enter?: Date,
    space_id: number,
    date_hour_exit?: Date
}

export class VisitSpacePassHourModel implements IVisitSpacePassHourModelProps{
    pass_id: number
    date_hour_enter?: Date
    space_id: number
    date_hour_exit?: Date

    constructor(props:IVisitSpacePassHourModelProps) {
        this.pass_id = props.pass_id;
        this.space_id = props.space_id;
        this.date_hour_enter = props.date_hour_enter;
        this.date_hour_exit = props.date_hour_exit;
    }
}