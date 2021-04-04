export interface IPresenceProps {
    presenceId?:number,
    dateHourStart?: Date,
    dateHourEnd?: Date,
    userId?: number
}
export interface Timelimit {
    dateStart: Date,
    dateEnd: Date
}
export class PresenceModel implements IPresenceProps{
    presenceId?:number;
    dateHourStart?: Date;
    dateHourEnd?: Date;
    userId?: number;

    constructor(props:IPresenceProps) {
        this.presenceId = props.presenceId;
        this.dateHourStart = props.dateHourStart;
        this.dateHourEnd = props.dateHourEnd;
        this.userId = props.userId
    }

}