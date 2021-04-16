import {DateUtils} from "../Utils";

export interface IMaintenanceProps {
    id?: number,
    dateHourStart?: DateUtils,
    dateHourEnd?: DateUtils,
    spaceId?: number,
    managerId?: number
}

export class MaintenanceModel implements IMaintenanceProps{

    id?: number;
    dateHourStart?: DateUtils;
    dateHourEnd?: DateUtils;
    spaceId?: number;
    managerId?: number;

    constructor(props: IMaintenanceProps) {
        this.id = props.id;
        this.dateHourStart = props.dateHourStart;
        this.dateHourEnd = props.dateHourEnd;
        this.spaceId = props.spaceId;
        this.managerId = props.managerId;
    }

    dateStartAndEndAreEqual () {
        return this.dateHourStart === this.dateHourEnd;
    }
}