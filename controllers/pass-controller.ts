import {
    IPassProps,
    IUsePassUserDateModelProps,
    LogError,
    PassModel,
    UsePassUserDateModel,
    IVisitSpacePassHourModelProps,
    VisitSpacePassHourModel
} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {DateUtils} from "../Utils";
import {PassTypeController} from "./pass-type-controller";
import {SATURDAY, SUNDAY} from "../consts";
import {SpaceController} from "./space-controller";
import {PresenceController} from "./presence-controller";


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
            return new LogError({numError: 400, text: "There is no pass id"});

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
        return new LogError({numError: 404, text: "Pass not found"});
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
            return new LogError({numError: 400, text: "The pass update failed"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "The pass update failed"});
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
            const dateHourPurchaseString = DateUtils.convertDateToISOString(dateHourPurchase);
            const dateHourPeremptionString = DateUtils.convertDateToISOString(dateHourPeremption);
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
            return new LogError({numError: 400, text: "Couldn't buy pass"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "Couldn't buy pass"});
        }
    }

    /**
     * Vrai si le billet existe
     * @param passId
     */
    async doesPassExist(passId: number): Promise<boolean> {
        const isTreatmentValid = await this.connection.query(`SELECT pass_id FROM PASS WHERE pass_id = ${passId}`);
        const result = isTreatmentValid[0] as RowDataPacket[];
        return result.length > 0;
    }

    /**
     * Récupération d'une utilisation de billet via :
     * @param passId
     * @param actualDate
     */
    async getUseByDateHourAndPassId(passId: number, actualDate: string): Promise<UsePassUserDateModel | LogError> {
        const res = await this.connection.query(`SELECT pass_id, date_hour
                                                 FROM USE_PASS_DATE
                                                 WHERE date_hour = ?
                                                   AND pass_id = ?`, [
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
        return new LogError({numError: 404, text: "Use not found"});
    }

    /**
     * Vrai si le billet a déjà été utilisé aujourd'hui
     * @param options
     */
    async passWasUsedToday(options: IUsePassUserDateModelProps): Promise<boolean> {
        const date = DateUtils.convertDateToISOString(options.dateHour).split(" ")[0] + "%";
        const passWasUsedToday = await this.connection.query(`SELECT pass_id
                                                              FROM USE_PASS_DATE
                                                              WHERE pass_id = ?
                                                                AND date_hour LIKE ?`, [
            options.passId,
            date
        ]);
        const result = passWasUsedToday[0] as RowDataPacket[];
        return result.length > 0;
    }

    /**
     * Vrai si le billet a expiré
     * @param passId
     * @param actualDateHour
     */
    async passIsExpired(passId: number, actualDateHour: string): Promise<boolean> {
        const passWasUsedToday = await this.connection.query(`SELECT pass_id
                                                              FROM PASS
                                                              WHERE pass_id = ?
                                                                AND date_hour_peremption < ?`, [
            passId,
            actualDateHour
        ]);
        const result = passWasUsedToday[0] as RowDataPacket[];
        return result.length > 0;
    }

    /**
     * Vrai si le billet est utilisable aujourd'hui
     * @param options
     */
    async isUsedInAValidDay(options: IUsePassUserDateModelProps): Promise<boolean> {
        const passTypeConstroller = new PassTypeController(this.connection);
        const pass = await this.getPassById(options.passId);
        if (pass instanceof LogError) {
            return false;
        }
        //vérifier que l'utilisation du pass night est après 18h
        if (await passTypeConstroller.isNightPassType(pass.passTypeId)) {
            if (DateUtils.getCurrentDate().getHours() >= 18) {
                return true;
            }
        }
        //pass journée/ESCAPE GAME utilisable une seule fois (vérifier qu'il n'a pas encore été utilisé)
        if (await passTypeConstroller.isEscapeGamePassType(pass.passTypeId) ||
            await passTypeConstroller.isUniqueDayPassType(pass.passTypeId) ||
            await passTypeConstroller.isNightPassType(pass.passTypeId)) {
            const passWasUsedToday = await this.connection.query(`SELECT *
                                                                  FROM USE_PASS_DATE
                                                                  WHERE pass_id = ?`, [
                options.passId
            ]);
            const result = passWasUsedToday[0] as RowDataPacket[];
            return result.length === 0;
        }
        //pass week-end utilisable uniquement en week-end
        else if (await passTypeConstroller.isWeekEndPassType(pass.passTypeId)) {
            if (DateUtils.getCurrentDate().getDay() === SATURDAY || DateUtils.getCurrentDate().getDay() === SUNDAY) {
                return true;
            }
        }
        //pass 1 day per month utilisable une seule fois dans le mois, vérifier qu'il n'a pas encore été utilisé ce mois
        else if (await passTypeConstroller.is1DayPerMonthPassType(pass.passTypeId)) {
            const firstDayOfMonthDateString = DateUtils.convertDateToISOString(new Date(DateUtils.getCurrentDate().getFullYear(), DateUtils.getCurrentDate().getMonth(), 1, 2));
            const passWasUsedToday = await this.connection.query(`SELECT *
                                                                  FROM USE_PASS_DATE
                                                                  WHERE pass_id = ?
                                                                    AND date_hour >= ?`, [
                options.passId,
                firstDayOfMonthDateString
            ]);
            const result = passWasUsedToday[0] as RowDataPacket[];
            return result.length === 0;
        }
        return false;
    }

    /**
     * Validation d'un billet à l'entrée du parc à une date (la date actuelle)
     * @param passId
     * @param userId
     */
    async usePassForUserAtActualDate(passId: number, userId: number | undefined): Promise<UsePassUserDateModel | LogError> {
        const presenceController = new PresenceController(this.connection);
        if (userId === undefined)
            return new LogError({numError: 400, text: "There is no user connected"});

        const actualDate = new Date(DateUtils.getCurrentTimeStamp());
        if (!await presenceController.isZooCouldBeOpen({dateStart: actualDate, dateEnd: actualDate}))
            return new LogError({numError: 409, text: "Zoo is not open"});

        //vérification que le billet existe
        const pass = await this.getPassById(passId);
        if (pass instanceof LogError) {
            return pass;
        }
        //vérification que l'utilisateur connecté est le propriétaire du billet
        if (pass.userId !== userId) {
            return new LogError({numError: 403, text: "It's not your pass"});
        }
        try {
            const actualDateString = DateUtils.convertDateToISOString(actualDate);
            //vérification que le pass est valide
            if (await this.passIsExpired(passId, actualDateString)) {
                return new LogError({numError: 409, text: "Pass is expired"})
            }
            //vérification que le pass est utilisable aujourd'hui
            if (!await this.isUsedInAValidDay({passId, dateHour: actualDate})) {
                return new LogError({numError: 409, text: "Pass can't be used"});
            }
            //vérification que le pass n'a pas encore été utilisé dans la journée
            if (await this.passWasUsedToday({passId, dateHour: actualDate})) {
                return new LogError({numError: 409, text: "Pass was already used today"})
            }

            await this.connection.execute("INSERT INTO DATE_HOUR (date_hour) VALUES (?)", [
                actualDateString
            ]);
            const res = await this.connection.execute("INSERT INTO USE_PASS_DATE (pass_id, date_hour) VALUES (?, ?)", [
                passId,
                actualDateString
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getUseByDateHourAndPassId(passId, actualDateString);
            }
            return new LogError({numError: 400, text: "Couldn't use pass"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "Couldn't use pass"});
        }
    }

    /**
     * Visite un espace avec un Pass
     * @param options
     */
    async usePassInSpaceForUser(options: VisitSpacePassHourModel): Promise<VisitSpacePassHourModel | LogError> {
        if (options.pass_id === undefined || options.space_id === undefined) {
            return new LogError({numError: 400, text: "passId and spaceId should be specified"});
        }
        if (!await SpaceController.doesSpaceExist(options.space_id, this.connection))
            return new LogError({numError: 404, text: "this spaceId doesn't exist"});

        // si besoin, va update la date de fin de la dernière visite de l'utilisateur avant d'en créer une nouvelle
        await this.updateLastVisitFrom(options);

        const actualDate = new Date(DateUtils.getCurrentTimeStamp());
        try {
            const actualDateString = DateUtils.convertDateToISOString(actualDate);
            await this.connection.execute("INSERT INTO DATE_HOUR (date_hour) VALUES (?)", [
                actualDateString
            ]);
            // Ajoute la visite
            const res = await this.connection.execute("INSERT INTO VISIT_SPACE_PASS_HOUR (pass_id,date_hour_enter, space_id) VALUES (?, ?,?)", [
                options.pass_id,
                actualDateString,
                options.space_id
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getLastVisitFrom(options);
            }
            return new LogError({numError: 400, text: "Visit failed"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "Visit failed"});
        }
    }

    /**
     * Retourn la dernière visite en fonction du pass et de l'espace
     * @param options
     */
    async getLastVisitFrom(options: IVisitSpacePassHourModelProps): Promise<VisitSpacePassHourModel | LogError> {
        if (options.pass_id === undefined || options.space_id === undefined) {
            return new LogError({numError: 400, text: "passId and spaceId should be specified"});
        }

        const res = await this.connection.query(`SELECT pass_id, date_hour_enter, space_id, date_hour_exit
                                                    FROM VISIT_SPACE_PASS_HOUR where pass_id = ${options.pass_id} AND space_id = ${options.space_id} ORDER BY date_hour_enter DESC LIMIT 1`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new VisitSpacePassHourModel({
                    pass_id: Number.parseInt(row["pass_id"]),
                    date_hour_enter: row["date_hour_enter"],
                    space_id: row["space_id"],
                    date_hour_exit: row["date_hour_exit"]
                });
            }
        }
        return new LogError({numError: 404, text: "Visit not found"});
    }

    /**
     * Update le champ date_hour_exit de la dernière visite par l'heure actuelle
     * @param options
     */
    async updateLastVisitFrom(options: IVisitSpacePassHourModelProps): Promise<boolean> {
        if (options.pass_id === undefined) {
            return false;
        }

        const resLastSpaceVisited = await this.connection.query(`SELECT pass_id, date_hour_enter, space_id, date_hour_exit
                                                    FROM VISIT_SPACE_PASS_HOUR where pass_id = ${options.pass_id} AND date_hour_exit IS NULL ORDER BY date_hour_enter DESC LIMIT 1`);
        const data = resLastSpaceVisited[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                const actualDate = new Date(DateUtils.getCurrentTimeStamp());
                try {
                    const actualDateString = DateUtils.convertDateToISOString(actualDate);
                    const lastSpaceVisted = new VisitSpacePassHourModel({
                        pass_id: Number.parseInt(row["pass_id"]),
                        date_hour_enter: row["date_hour_enter"],
                        space_id: row["space_id"],
                        date_hour_exit: row["date_hour_exit"]
                    });

                    const res = await this.connection.execute(`UPDATE VISIT_SPACE_PASS_HOUR
                                                               SET date_hour_exit = ?
                                                               WHERE pass_id = ?
                                                                 AND date_hour_enter = ?
                                                                 AND SPACE_ID = ? `,
                        [
                            actualDateString,
                            lastSpaceVisted.pass_id,
                            lastSpaceVisted.date_hour_enter,
                            lastSpaceVisted.space_id
                        ]);
                    const headers = res[0] as ResultSetHeader;
                    return headers.affectedRows === 1;

                } catch (err) {
                    console.log(err);
                    return false;
                }
            }
            return false;
        }
        return false;
    }
}


