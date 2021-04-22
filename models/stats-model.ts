
export interface IStatsModel {
    affluenceDay?: number,
    affluenceWeek?: number,
    affluenceMonth?: number,
    affluenceYear?: number
}

export class StatsModel implements IStatsModel {

    affluenceDay?: number;
    affluenceWeek?: number;
    affluenceMonth?: number;
    affluenceYear?: number;

    constructor(props: IStatsModel) {
        this.affluenceDay = props.affluenceDay;
        this.affluenceWeek = props.affluenceWeek;
        this.affluenceMonth = props.affluenceMonth;
        this.affluenceYear = props.affluenceYear;
    }
}