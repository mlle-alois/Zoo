import {LogError, StatsModel} from "../models"
import {Connection, RowDataPacket} from "mysql2/promise";
import {DateUtils} from "../Utils";

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
}
