import {IPassProps, IUsePassUserDateModelProps, LogError, PassModel, UsePassUserDateModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {DateUtils} from "../Utils";

interface PassGetAllOptions {
    limit?: number;
    offset?: number;
}

export class PassController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de tous les billets
     * @param options -> Limit et offset de la requete
     */
    async getAllPass(options?: PassGetAllOptions): Promise<PassModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des pass
        const res = await this.connection.query(`SELECT pass_id, date_hour_purchase, date_hour_peremption, pass_type_id, user_id 
                                                    FROM PASS LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new PassModel({
                    passId: Number.parseInt(row["pass_id"]),
                    dateHourPurchase: row["date_hour_purchase"],
                    dateHourPeremption: row["date_hour_peremption"],
                    passTypeId: Number.parseInt(row["pass_type_id"]),
                    userId: Number.parseInt(row["user_id"])
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id du billet maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxPassId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(pass_id) as maxId FROM PASS');
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
     * Récupération d'un billet via :
     * @param passId
     */
    async getPassById(passId: number): Promise<PassModel | LogError> {
        if (passId === undefined)
            return new LogError({numError:400, text:"There is no pass id"});

        const res = await this.connection.query(`SELECT pass_id, date_hour_purchase, date_hour_peremption, pass_type_id, user_id 
                                                    FROM PASS where pass_id = ${passId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new PassModel({
                    passId: Number.parseInt(row["pass_id"]),
                    dateHourPurchase: row["date_hour_purchase"],
                    dateHourPeremption: row["date_hour_peremption"],
                    passTypeId: Number.parseInt(row["pass_type_id"]),
                    userId: Number.parseInt(row["user_id"])
                });
            }
        }
        return new LogError({numError:404, text:"Pass not found"});
    }

    /**
     * Suppression d'un billet depuis son :
     * @param passId
     */
    async removePassById(passId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM PASS where pass_id = ${passId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'un billet renseignées dans les options
     * @param options
     */
    async updatePass(options: IPassProps): Promise<PassModel | LogError> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.dateHourPeremption !== undefined) {
            setClause.push("date_hour_peremption = ?");
            params.push(options.dateHourPeremption);
        }
        if (options.passTypeId !== undefined) {
            setClause.push("pass_type_id = ?");
            params.push(options.passTypeId);
        }
        if (options.userId !== undefined) {
            setClause.push("user_id = ?");
            params.push(options.userId);
        }
        params.push(options.passId);
        try {
            const res = await this.connection.execute(`UPDATE PASS SET ${setClause.join(", ")} WHERE pass_id = ?`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getPassById(options.passId);
            }
            return new LogError({numError:400,text:"The pass update failed"});
        } catch (err) {
            console.error(err);
            return new LogError({numError:400,text:"The pass update failed"});
        }
    }

    /**
     * achat d'un pass
     * @param options
     */
    async buyPass(options: IPassProps): Promise<PassModel | LogError> {
        const dateHourPurchase = new Date(DateUtils.getCurrentTimeStamp());
        const dateHourPeremption = new Date(dateHourPurchase.getFullYear() + 1, dateHourPurchase.getMonth(), dateHourPurchase.getDay());
        try {
            const dateHourPurchaseString = ((dateHourPurchase.toISOString().replace("T", " ")).split("."))[0];
            const dateHourPeremptionString = ((dateHourPeremption.toISOString().replace("T", " ")).split("."))[0];
            const res = await this.connection.execute("INSERT INTO PASS (pass_id, date_hour_purchase, date_hour_peremption, pass_type_id, user_id) VALUES (?, ?, ?, ?, ?)", [
                options.passId,
                dateHourPurchaseString,
                dateHourPeremptionString,
                options.passTypeId,
                options.userId
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getPassById(options.passId);
            }
            return new LogError({numError:400,text:"Couldn't buy pass"});
        } catch (err) {
            console.error(err);
            return new LogError({numError:400,text:"Couldn't buy pass"});
        }
    }

    /**
     * Vrai si le billet existe
     * @param passId
     */
    async doesPassExist(passId: number) {
        const isTreatmentValid = await this.connection.query(`SELECT pass_id FROM PASS WHERE pass_id = ${passId}`);
        const result = isTreatmentValid[0] as RowDataPacket[];
        return result.length > 0;
    }

    /**
     * Récupération d'une utilisation de billet via :
     * @param passId
     * @param actualDate
     */
    async getUseByDateHourAndPassId(passId: number, actualDate: string): Promise<UsePassUserDateModel | null> {
        const res = await this.connection.query(`SELECT pass_id, date_hour
                                                    FROM USE_PASS_DATE WHERE date_hour = ? AND pass_id = ?`, [
            actualDate,
            passId
        ]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new UsePassUserDateModel({
                    dateHour: new Date(row["date_hour"]),
                    passId: Number.parseInt(row["pass_id"])
                });
            }
        }
        return null;
    }

    /**
     * Validation d'un billet à l'entrée du parc à une date (la date actuelle)
     * @param options
     */
    async usePassForUserAtActualDate(options: IUsePassUserDateModelProps): Promise<UsePassUserDateModel | null> {
        if(options.passId === undefined) {
            return null;
        }
        const actualDate = new Date(DateUtils.getCurrentTimeStamp());
        try {
            const actualDateString = ((actualDate.toISOString().replace("T", " ")).split("."))[0];
            await this.connection.execute("INSERT INTO DATE_HOUR (date_hour) VALUES (?)", [
                actualDateString
            ]);
            const res = await this.connection.execute("INSERT INTO USE_PASS_DATE (pass_id, date_hour) VALUES (?, ?)", [
                options.passId,
                actualDateString
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1 && options.passId !== undefined) {
                return this.getUseByDateHourAndPassId(options.passId, actualDateString);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

}