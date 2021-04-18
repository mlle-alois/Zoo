import {IPresenceProps, LogError, PresenceModel, Timelimit} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {CLEANING_AGENT_ID, RECEPTIONIST_ID, SALESPERSON_ID, VETERINARY_ID} from "../consts";
import {DateUtils} from "../Utils";


interface PresenceGetAllOptions {
    limit?: number;
    offset?: number;
}


export class PresenceController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de toutes les présences
     * @param options -> Limit et offset de la requete
     */
    async getAllPresence(options?: PresenceGetAllOptions): Promise<PresenceModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des présences
        const res = await this.connection.query(`SELECT presence_id, dateHourStart_presence, dateHourEnd_presence,user_id 
                                                    FROM PRESENCE LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new PresenceModel({
                    presenceId: Number.parseInt(row["presence_id"]),
                    dateHourStart: row["dateHourStart_presence"],
                    dateHourEnd: row["dateHourStart_presence"],
                    userId: row["user_id"]
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id de l'présence maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxPresenceId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(presence_id) as maxId FROM PRESENCE');
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
     * Récupération d'une présence via :
     * @param PresenceId
     */
    async getPresenceById(PresenceId: number | undefined): Promise<PresenceModel | null> {
        if (PresenceId === undefined)
            return null;

        const res = await this.connection.query(`SELECT presence_id, dateHourStart_presence, dateHourEnd_presence,user_id 
                                                    FROM PRESENCE where presence_id = ${PresenceId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new PresenceModel({
                    presenceId: Number.parseInt(row["presence_id"]),
                    dateHourStart: row["dateHourStart_presence"],
                    dateHourEnd: row["dateHourEnd_presence"],
                    userId: row["user_id"]
                });
            }
        }
        return null;
    }

    /**
     * Récupération de toutes les presences  via :
     * @param UserId
     */
    async getPresenceByUser(UserId: number): Promise<PresenceModel[] | null> {

        //récupération de l'présence
        const res = await this.connection.query(`SELECT presence_id, dateHourStart_presence, dateHourEnd_presence,user_id
                                                    FROM PRESENCE where user_id = ${UserId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new PresenceModel({
                    presenceId: Number.parseInt(row["presence_id"]),
                    dateHourStart: row["dateHourStart_presence"],
                    dateHourEnd: row["dateHourStart_presence"],
                    userId: row["user_id"]
                });
            });
        }
        return [];
    }

    /**
     * Suppression d'une présence depuis son :
     * @param PresenceId
     */
    async removePresenceById(PresenceId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM PRESENCE where presence_id  = ${PresenceId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'une présence renseignées dans les options
     * @param options
     */
    async updatePresence(options: IPresenceProps): Promise<PresenceModel | null | string> {
        const isTimeScheduleValid = await this.isPresenceValid(options);
        if (!isTimeScheduleValid) {
            return "You already have something scedule during this time";
        }

        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.presenceId !== undefined) {
            setClause.push("presence_id = ?");
            params.push(options.presenceId);
        }
        if (options.userId !== undefined) {
            setClause.push("user_id = ?");
            params.push(options.userId);
        }
        if (options.dateHourStart !== undefined) {
            setClause.push("dateHourStart_presence = ?");
            params.push(options.dateHourStart);
        }
        if (options.dateHourEnd !== undefined) {
            setClause.push("dateHourEnd_presence = ?");
            params.push(options.dateHourEnd);
        }
        setClause.push()
        try {
            const res = await this.connection.execute(`UPDATE PRESENCE SET ${setClause.join(", ")}`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getPresenceById(options.presenceId);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }


    /**
     * création d'une présence en vérifiant si c'est possible
     * @param options
     *
     */
    async createPresence(options: IPresenceProps): Promise<PresenceModel | null | string> {
        try {

            const isTimeScheduleValid = await this.isPresenceValid(options);
            if (!isTimeScheduleValid) {
                return "You already have something scedule during this time";
            }


            const res = await this.connection.execute("INSERT INTO PRESENCE (presence_id,dateHourStart_presence,dateHourEnd_presence,user_id) VALUES (?,?,?,?)", [
                options.presenceId,
                options.dateHourStart,
                options.dateHourEnd,
                options.userId
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getPresenceById(options.presenceId);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }

    }

    /**
     * Renvoie un booléen indiquant s'il y a assez de personnes disponibles pour l'ouverture du zoo
     * @param options
     *
     */
    async isZooCouldBeOpen(options: Timelimit): Promise<boolean | null> {
        // selectionne les utilisateurs présents dans la tranche horaires
        const res = await this.connection.query(`SELECT user_id
                                                 FROM PRESENCE
                                                 WHERE dateHourStart_presence <= ?
                                                   AND dateHourEnd_presence > ?`, [
            DateUtils.convertDateToISOString(options.dateStart),
            DateUtils.convertDateToISOString(options.dateEnd)
        ]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length < 4)
                return false;

            if (rows.length > 0) {
                // Converti le resultat dans un tableau d'index pour la deuxième selection
                const users = rows.map(function (el) {
                    return el["user_id"];
                });
                // Selectionne tous les user_type des users présents dans la tranche horaire
                const resValidStaff = await this.connection.query('SELECT user_type_id FROM USER where user_id IN (?)', [users]);
                const validStaff = resValidStaff[0];

                if (Array.isArray(validStaff)) {
                    const rows = validStaff as RowDataPacket[];
                    if (rows.length < 4)
                        return false;
                    if (rows.length > 0) {
                        const validStaffs = rows.map(function (el) {
                            return el["user_type_id"];
                        });
                        // Vérrifie s'il y a au moins un staff de chaque dans la selection, puis return true ou false
                        const receptionist = validStaffs.find(staff => staff === RECEPTIONIST_ID);
                        const veterinary = validStaffs.find(staff => staff === VETERINARY_ID);
                        const cleaningAgent = validStaffs.find(staff => staff === CLEANING_AGENT_ID);
                        const salesPerson = validStaffs.find(staff => staff === SALESPERSON_ID);

                        return !!(receptionist && veterinary && cleaningAgent && salesPerson);

                    }
                }

            }
        }
        return false;
    }

    private async isPresenceValid(options: IPresenceProps) {
        const isPresenceValid = await this.connection.query(`SELECT presence_id, dateHourStart_presence, dateHourEnd_presence,user_id 
    FROM PRESENCE WHERE dateHourEnd_presence BETWEEN "${options.dateHourStart}" AND "${options.dateHourEnd}" AND dateHourStart_presence BETWEEN "${options.dateHourStart}" AND "${options.dateHourEnd}" AND user_id = ${options.userId}`);
        const result = isPresenceValid[0] as RowDataPacket[];
        return result.length <= 0;
    }

    /* private async CheckIfLastPresenceIsEnded(options: IPresenceProps): Promise<boolean> {
         const res1 = await this.connection.query(`SELECT presence_id, dateHourStart_presence, dateHourEnd_presence,user_id
                                                     FROM PRESENCE WHERE dateHourEnd_presence IS NULL AND user_id = ${options.userId}`);
         return !res1;
     }*/
}