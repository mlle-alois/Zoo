import {LogError, StatsModel} from "../models"
import {Connection, RowDataPacket} from "mysql2/promise";
import {DateUtils} from "../Utils";
import {SpaceController} from "./space-controller";

interface StatsGetAllOptions {
    limit?: number;
    offset?: number;
}

export class StatsController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Stats des fréquentation d'un espace sur un jour
     * @param spaceId
     * @param day
     * @param options -> Limit et offset de la requete
     */
    async getStatsByDay(spaceId: number, day: Date, options?: StatsGetAllOptions): Promise<StatsModel | LogError> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        const dayEnd = new Date(day);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const res = await this.connection.query(`SELECT COUNT(*) FROM VISIT_SPACE_PASS_HOUR WHERE space_id = ${spaceId}
                                                 AND date_hour_enter BETWEEN '${DateUtils.convertDateToISOString(day)}' 
                                                     AND '${DateUtils.convertDateToISOString(dayEnd)}' LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new StatsModel({
                    affluenceDay: Number.parseInt(row["COUNT(*)"])
                });
            }
        }
        return new LogError({numError: 400, text: ""});
    }

    /**
     * Stats des fréquentation d'un espace sur une semaine
     * @param spaceId
     * @param week
     * @param options -> Limit et offset de la requete
     */
    async getStatsByWeek(spaceId: number, week: Date, options?: StatsGetAllOptions): Promise<StatsModel | LogError> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        let count = 0;
        if (week.getDay() > 0) {
            for (let i = week.getDay(); i > 1; i--) {
                count++;
            }
            week.setDate(week.getDate() - count);
        }
        const weekEnd = new Date(week);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const res = await this.connection.query(`SELECT COUNT(*) FROM VISIT_SPACE_PASS_HOUR WHERE space_id = ${spaceId}
                                                 AND date_hour_enter BETWEEN '${DateUtils.convertDateToISOString(week)}' 
                                                     AND '${DateUtils.convertDateToISOString(weekEnd)}' LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new StatsModel({
                    affluenceWeek: Number.parseInt(row["COUNT(*)"])
                });
            }
        }
        return new LogError({numError: 400, text: ""});
    }

    /**
     * Stats des fréquentation d'un espace sur un mois
     * @param spaceId
     * @param month
     * @param options -> Limit et offset de la requete
     */
    async getStatsByMonth(spaceId: number, month: Date, options?: StatsGetAllOptions): Promise<StatsModel | LogError> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        const monthEnd = new Date(month);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        const res = await this.connection.query(`SELECT COUNT(*) FROM VISIT_SPACE_PASS_HOUR WHERE space_id = ${spaceId}
                                                 AND date_hour_enter BETWEEN '${DateUtils.convertDateToISOString(month)}' 
                                                     AND '${DateUtils.convertDateToISOString(monthEnd)}' LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new StatsModel({
                    affluenceMonth: Number.parseInt(row["COUNT(*)"])
                });
            }
        }
        return new LogError({numError: 400, text: ""});
    }

    /**
     * Stats des fréquentation d'un espace sur une année
     * @param spaceId
     * @param year
     * @param options -> Limit et offset de la requete
     */
    async getStatsByYear(spaceId: number, year: Date, options?: StatsGetAllOptions): Promise<StatsModel | LogError> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        const yearEnd = new Date(year);
        yearEnd.setFullYear(yearEnd.getFullYear() + 1);
        const res = await this.connection.query(`SELECT COUNT(*) FROM VISIT_SPACE_PASS_HOUR WHERE space_id = ${spaceId}
                                                 AND date_hour_enter BETWEEN '${DateUtils.convertDateToISOString(year)}' 
                                                     AND '${DateUtils.convertDateToISOString(yearEnd)}' LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new StatsModel({
                    affluenceYear: Number.parseInt(row["COUNT(*)"])
                });
            }
        }
        return new LogError({numError: 400, text: ""});
    }

    /**
     * Stats des fréquentation du parc sur la journée en cours
     */
    async getZooStats(): Promise<Array<any> | LogError> {
        //récupération des options
        const spaceController = new SpaceController(this.connection);
        const day = new Date();
        day.setHours(0,0,0);
        DateUtils.addXHoursToDate(day, 2);
        const dayEnd = new Date(day);
        DateUtils.addXHoursToDate(dayEnd, 24);
        let res;
        const frequencyArray = [];
        let numberOfSpaces;

        frequencyArray[0] = await this.connection.query(`SELECT COUNT(*) FROM VISIT_SPACE_PASS_HOUR WHERE
                                                date_hour_enter BETWEEN '${DateUtils.convertDateToISOString(day)}'
                                                AND '${DateUtils.convertDateToISOString(dayEnd)}'`);
        let data = frequencyArray[0][0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                numberOfSpaces = Number.parseInt(row["COUNT(*)"]);
                if (numberOfSpaces === 0) {
                    frequencyArray[0] = "Il n'y a personne dans le zoo actuellement.";
                    return frequencyArray;
                }
                frequencyArray[0] = "Nombre de visiteurs dans le zoo : " + numberOfSpaces;
            }
        }
        res = await this.connection.query(`SELECT space_id, COUNT(*) FROM VISIT_SPACE_PASS_HOUR WHERE 
                                             date_hour_enter BETWEEN '${DateUtils.convertDateToISOString(day)}'
                                             AND '${DateUtils.convertDateToISOString(dayEnd)}' GROUP BY space_id`);
        data = res[0];
        if (Array.isArray(data) && numberOfSpaces !== undefined) {
            for (let i = 0; i < numberOfSpaces; i++) {
                const rows = data as RowDataPacket[];
                if (rows.length > 0) {
                    const row = rows[0];
                    const space = await spaceController.getSpaceById(rows[i].space_id);
                    if (!(space instanceof LogError)) {
                        frequencyArray[i + 1] = space.spaceName + " : " + Number.parseInt(row["COUNT(*)"]);
                    } else {
                        return new LogError({numError: 400});
                    }
                }
            }
            return frequencyArray
        }
        return new LogError({numError: 400});
    }
}
