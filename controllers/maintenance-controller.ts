import {IMaintenanceProps, LogError, MaintenanceModel} from "../models"
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {DateUtils} from "../Utils";

interface MaintenanceGetAllOptions {
    limit?: number;
    offset?: number;
}

export class MaintenanceController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de toutes les maintenances
     * @param options -> Limit et offset de la requete
     */
    async getAllMaintenance(options?: MaintenanceGetAllOptions): Promise<MaintenanceModel[] | LogError> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        const res = await this.connection.query(`SELECT maintenance_id, date_hour_start, date_hour_end, space_id, manager_id 
                                                    FROM MAINTENANCE LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new MaintenanceModel({
                    id: Number.parseInt(row["maintenance_id"]),
                    dateHourStart: DateUtils.convertDateToISOString(DateUtils.addXHoursToDate(row["date_hour_start"], 2)),
                    dateHourEnd: DateUtils.convertDateToISOString(DateUtils.addXHoursToDate(row["date_hour_end"], 2)),
                    spaceId: Number.parseInt(row["space_id"]),
                    managerId: Number.parseInt(row["manager_id"])
                });
            });
        }
        return new LogError({numError: 404, text: "No maintenance found"});
    }

    /**
     * Récupération de l'id de la maintenance maximum existante
     * Utile pour l'incrémentation manuelle
     */
    async getMaintenanceId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(maintenance_id) as maxId FROM MAINTENANCE');
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                if (row["maxId"] === null) {
                    return 0;
                } else {
                    return row["maxId"];
                }
            }
        }
        return 0;
    }

    /**
     * Récupération d'une maintenance via :
     * @param maintenanceId
     */
    async getMaintenanceById(maintenanceId: number | undefined): Promise<MaintenanceModel | LogError> {
        //récupération de l'utilisateur
        if (maintenanceId === undefined)
            return new LogError({numError: 400, text: "There is no maintenance id"});

        const res = await this.connection.query(`SELECT maintenance_id, date_hour_start, date_hour_end, space_id, manager_id
                                                    FROM MAINTENANCE where maintenance_id = ${maintenanceId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new MaintenanceModel({
                    id: Number.parseInt(row["maintenance_id"]),
                    dateHourStart: DateUtils.convertDateToISOString(DateUtils.addXHoursToDate(row["date_hour_start"], 2)),
                    dateHourEnd: DateUtils.convertDateToISOString(DateUtils.addXHoursToDate(row["date_hour_end"], 2)),
                    spaceId: Number.parseInt(row["space_id"]),
                    managerId: Number.parseInt(row["manager_id"])
                });
            }
        }
        return new LogError({numError: 404, text: "Maintenance not found"});
    }

    /**
     * Récupération des maintenances via :
     * @param space
     */
    async getMaintenanceBySpace(space: string): Promise<MaintenanceModel[] | LogError> {

        const res = await this.connection.query(`SELECT maintenance_id, date_hour_start, date_hour_end, space_id, manager_id 
                                                    FROM MAINTENANCE where space_id = ${space}`);
        const data = res[0];
        if (Array.isArray(data) && data.length !== 0) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new MaintenanceModel({
                    id: Number.parseInt(row["maintenance_id"]),
                    dateHourStart: DateUtils.convertDateToISOString(DateUtils.addXHoursToDate(row["date_hour_start"], 2)),
                    dateHourEnd: DateUtils.convertDateToISOString(DateUtils.addXHoursToDate(row["date_hour_end"], 2)),
                    spaceId: Number.parseInt(row["space_id"]),
                    managerId: Number.parseInt(row["manager_id"])
                });
            });
        }
        return new LogError({numError: 404, text: "No maintenance found"});
    }

    /**
     * Vérifie si un espace est actuellement en maintenance ou non
     * @param space
     */
    async isSpaceAvailable(space: number): Promise<boolean> {

        const res = await this.connection.query(`SELECT * FROM MAINTENANCE WHERE date_hour_start = date_hour_end
                                                    AND space_id = ${space}`);
        const data = res[0];
        return !(Array.isArray(data) && data.length === 0);

    }

    /**
     * Récupération des maintenances via :
     * @param manager
     */
    async getMaintenanceByManager(manager: string): Promise<MaintenanceModel[] | LogError> {

        const res = await this.connection.query(`SELECT maintenance_id, date_hour_start, date_hour_end, space_id, manager_id 
                                                    FROM MAINTENANCE where manager_id = ${manager}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new MaintenanceModel({
                    id: Number.parseInt(row["maintenance_id"]),
                    dateHourStart: DateUtils.convertDateToISOString(DateUtils.addXHoursToDate(row["date_hour_start"], 2)),
                    dateHourEnd: DateUtils.convertDateToISOString(DateUtils.addXHoursToDate(row["date_hour_end"], 2)),
                    spaceId: Number.parseInt(row["space_id"]),
                    managerId: Number.parseInt(row["manager_id"])
                });
            });
        }
        return new LogError({numError: 404, text: "No maintenance found"});
    }

    /**
     * Suppression d'une maintenance depuis son :
     * @param maintenanceId
     */
    async removeMaintenanceById(maintenanceId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM MAINTENANCE where maintenance_id  = ${maintenanceId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Création d'une maintenance
     * @param options
     */
    async createMaintenance(options: IMaintenanceProps): Promise<MaintenanceModel | LogError> {
        try {
            const res = await this.connection.execute(
                "INSERT INTO MAINTENANCE (maintenance_id, date_hour_start, date_hour_end, space_id, manager_id) VALUES (?,?,?,?,?)",
                [
                    options.id,
                    options.dateHourStart,
                    options.dateHourEnd,
                    options.spaceId,
                    options.managerId
                ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getMaintenanceById(options.id);
            }
            return new LogError({numError: 400, text: "Couldn't create maintenance"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "Couldn't create maintenance"});
        }
    }

    /**
     * Fermetures d'une maintenance en modifiant sa dateHourEnd
     * @param maintenanceId
     */
    async closeMaintenance(maintenanceId: number): Promise<MaintenanceModel | LogError> {
        const date = new Date(DateUtils.getCurrentTimeStamp());
        const convertedDate = DateUtils.convertDateToISOString(date);
        try {
            const res = await this.connection.execute(`UPDATE MAINTENANCE SET date_hour_end = "${convertedDate}" 
                                                            WHERE maintenance_id = ${maintenanceId}`);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getMaintenanceById(maintenanceId);
            }
            return new LogError({numError: 400, text: "Couldn't close maintenance"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "Couldn't close maintenance"});
        }
    }
}
