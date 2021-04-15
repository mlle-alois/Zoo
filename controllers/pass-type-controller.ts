import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {IPassTypeProps, PassTypeModel} from "../models/pass-type-model";
import {
    AccessPassSpaceModel,
    IAccessPassSpaceModelProps,
    LogError
} from "../models";
import {SpaceController} from "./space-controller";

interface PassTypeGetAllOptions {
    limit?: number;
    offset?: number;
}

export class PassTypeController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de tous les types de billets
     * @param options -> Limit et offset de la requete
     */
    async getAllPassType(options?: PassTypeGetAllOptions): Promise<PassTypeModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des passType
        const res = await this.connection.query(`SELECT pass_type_id, pass_type_name, pass_type_price, pass_type_is_available 
                                                    FROM PASS_TYPE LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new PassTypeModel({
                    passTypeId: Number.parseInt(row["pass_type_id"]),
                    passTypeName: row["pass_type_name"],
                    passTypePrice: Number.parseFloat(row["pass_type_price"]),
                    passTypeIsAvailable: row["pass_type_is_available"] as boolean
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id du type de billet maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxPassTypeId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(pass_type_id) as maxId FROM PASS_TYPE');
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
     * Récupération d'un type de billet via :
     * @param passTypeId
     */
    async getPassTypeById(passTypeId: number): Promise<PassTypeModel | LogError> {
        if (passTypeId === undefined)
            return new LogError({numError: 400, text: "There is no pass type id"});

        const res = await this.connection.query(`SELECT pass_type_id, pass_type_name, pass_type_price, pass_type_is_available 
                                                    FROM PASS_TYPE where pass_type_id = ${passTypeId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new PassTypeModel({
                    passTypeId: Number.parseInt(row["pass_type_id"]),
                    passTypeName: row["pass_type_name"],
                    passTypePrice: Number.parseFloat(row["pass_type_price"]),
                    passTypeIsAvailable: row["pass_type_is_available"] as boolean
                });
            }
        }
        return new LogError({numError: 404, text: "Pass type not found"});
    }

    /**
     * Récupération d'un accès type de billet via :
     * @param passTypeId
     * @param spaceId
     */
    async getAccessByPassTypeIdAndSpaceId(passTypeId: number, spaceId: number): Promise<AccessPassSpaceModel | LogError> {
        if (passTypeId === undefined || spaceId === undefined)
            return new LogError({numError: 400, text: "There is no pass type id or no space id"});

        const res = await this.connection.query(`SELECT pass_type_id, space_id, num_order_access
                                                 FROM GIVE_ACCESS_PASS_TYPE_SPACE
                                                 WHERE pass_type_id = ?
                                                   AND space_id = ?`, [
            passTypeId,
            spaceId
        ]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new AccessPassSpaceModel({
                    passTypeId: Number.parseInt(row["pass_type_id"]),
                    spaceId: Number.parseInt(row["space_id"]),
                    numOrderAccess: Number.parseInt(row["num_order_access"])
                });
            }
        }
        return new LogError({numError: 404, text: "Access not found"});
    }

    /**
     * Suppression d'un type de billet depuis son :
     * @param passTypeId
     */
    async removePassTypeById(passTypeId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM PASS_TYPE where pass_type_id = ${passTypeId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'un type de billet renseignées dans les options
     * @param options
     */
    async updatePassType(options: IPassTypeProps): Promise<PassTypeModel | LogError> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.passTypeName !== undefined) {
            setClause.push("pass_type_name = ?");
            params.push(options.passTypeName);
        }
        if (options.passTypePrice !== undefined) {
            setClause.push("pass_type_price = ?");
            params.push(options.passTypePrice);
        }
        if (options.passTypeIsAvailable !== undefined) {
            setClause.push("pass_type_is_available = ?");
            params.push(options.passTypeIsAvailable);
        }
        params.push(options.passTypeId);
        try {
            const res = await this.connection.execute(`UPDATE PASS_TYPE SET ${setClause.join(", ")} WHERE pass_type_id = ?`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getPassTypeById(options.passTypeId);
            }
            return new LogError({numError: 400, text: "The pass type update failed"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "The pass type update failed"});
        }
    }

    /**
     * création d'un passType
     * @param options
     */
    async createPassType(options: IPassTypeProps): Promise<PassTypeModel | LogError> {
        try {
            const res = await this.connection.execute("INSERT INTO PASS_TYPE (pass_type_id, pass_type_name, pass_type_price, pass_type_is_available) VALUES (?, ?, ?, ?)", [
                options.passTypeId,
                options.passTypeName,
                options.passTypePrice,
                options.passTypeIsAvailable
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getPassTypeById(options.passTypeId);
            }
            return new LogError({numError: 400, text: "Couldn't create pass type"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "Couldn't create pass type"});
        }
    }

    /**
     * Récupération de l'ordre d'accès à l'espace pour le pass maximum existant
     * Utile pour l'incrémentation manuelle
     * @param passTypeId
     * @param spaceId
     */
    async getMaxOrderByPassTypeIdAndSpaceId(passTypeId: number, spaceId: number): Promise<number> {
        const res = await this.connection.query('SELECT MAX(num_order_access) as maxOrder FROM GIVE_ACCESS_PASS_TYPE_SPACE WHERE pass_type_id = ? AND space_id = ?', [
            passTypeId,
            spaceId
        ]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                if (row["maxOrder"] === null) {
                    return 0;
                } else {
                    return row["maxOrder"];
                }
            }
        }
        return 0;
    }

    /**
     * création d'un accès à un espace pour un type de billet
     * @param options
     */
    async createAccessForPassTypeAtSpace(options: IAccessPassSpaceModelProps): Promise<AccessPassSpaceModel | LogError> {
        const passTypeController = new PassTypeController(this.connection);

        //vérification que l'espace existe
        if (!await SpaceController.doesSpaceExist(options.spaceId, this.connection)) {
            return new LogError({numError: 409, text: "L\'espace renseigné n\'existe pas"});
        }
        //vérification que le type de billet existe
        if (!await passTypeController.doesPassTypeExist(options.passTypeId)) {
            return new LogError({numError: 409, text: "Le type de billet renseigné n\'existe pas"});
        }
        //vérification si le type de billet a déjà accès à l'espace
        const passTypeAccess = await passTypeController.getAccessByPassTypeIdAndSpaceId(options.passTypeId, options.spaceId);
        if (!(passTypeAccess instanceof LogError)) {
            return new LogError({
                numError: 409,
                text: "L\'accès à cet espace est déjà possible pour ce type de billet"
            });
        }
        //numéro d'ordre récupéré si le billet est un escape game
        if (await passTypeController.isEscapeGamePassType(options.passTypeId)) {
            options.numOrderAccess = await this.getMaxOrderByPassTypeIdAndSpaceId(options.passTypeId, options.spaceId) + 1;
        } else {
            options.numOrderAccess = 0;
        }
        try {
            const res = await this.connection.execute("INSERT INTO GIVE_ACCESS_PASS_TYPE_SPACE (pass_type_id, space_id, num_order_access) VALUES (?, ?, ?)", [
                options.passTypeId,
                options.spaceId,
                options.numOrderAccess
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getAccessByPassTypeIdAndSpaceId(options.passTypeId, options.spaceId);
            }
            return new LogError({numError: 400, text: "Couldn't create access"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "Couldn't create access"});
        }
    }

    /**
     * Savoir si un type de billet est escape game via son :
     * @param passTypeId
     */
    async isEscapeGamePassType(passTypeId: number | undefined): Promise<boolean> {
        if (passTypeId === undefined) {
            return false;
        }
        const res = await this.connection.query('SELECT COUNT(*) as isEscapeGame FROM PASS_TYPE WHERE UPPER(pass_type_name) LIKE \'%ESCAPE%GAME%\' AND pass_type_id = ?', [passTypeId]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                if (row["isEscapeGame"] === null) {
                    return false;
                } else {
                    return (Number.parseInt(row["isEscapeGame"]) > 0);
                }
            }
        }
        return false;
    }

    /**
     * Savoir si un type de billet est UNIQUE DAY via son :
     * @param passTypeId
     */
    async isUniqueDayPassType(passTypeId: number | undefined): Promise<boolean> {
        if (passTypeId === undefined) {
            return false;
        }
        const res = await this.connection.query('SELECT COUNT(*) as isUniqueDay FROM PASS_TYPE WHERE UPPER(pass_type_name) LIKE \'%UNIQUE%DAY%\' AND pass_type_id = ?', [passTypeId]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                if (row["isUniqueDay"] === null) {
                    return false;
                } else {
                    return (Number.parseInt(row["isUniqueDay"]) > 0);
                }
            }
        }
        return false;
    }

    /**
     * Savoir si un type de billet est WEEK END via son :
     * @param passTypeId
     */
    async isWeekEndPassType(passTypeId: number | undefined): Promise<boolean> {
        if (passTypeId === undefined) {
            return false;
        }
        const res = await this.connection.query('SELECT COUNT(*) as isWeekEnd FROM PASS_TYPE WHERE UPPER(pass_type_name) LIKE \'%WEEK%END%\' AND pass_type_id = ?', [passTypeId]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                if (row["isWeekEnd"] === null) {
                    return false;
                } else {
                    return (Number.parseInt(row["isWeekEnd"]) > 0);
                }
            }
        }
        return false;
    }

    /**
     * Savoir si un type de billet est 1 DAY PER MONTH via son :
     * @param passTypeId
     */
    async is1DayPerMonthPassType(passTypeId: number | undefined): Promise<boolean> {
        if (passTypeId === undefined) {
            return false;
        }
        const res = await this.connection.query('SELECT COUNT(*) as is1DayPerMonth FROM PASS_TYPE WHERE UPPER(pass_type_name) LIKE \'%1%DAY%PER%MONTH%\' AND pass_type_id = ?', [passTypeId]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                if (row["is1DayPerMonth"] === null) {
                    return false;
                } else {
                    return (Number.parseInt(row["is1DayPerMonth"]) > 0);
                }
            }
        }
        return false;
    }

    /**
     * Savoir si un type de billet est NIGHT via son :
     * @param passTypeId
     */
    async isNightPassType(passTypeId: number | undefined): Promise<boolean> {
        if (passTypeId === undefined) {
            return false;
        }
        const res = await this.connection.query('SELECT COUNT(*) as isNight FROM PASS_TYPE WHERE UPPER(pass_type_name) LIKE \'%NIGHT%\' AND pass_type_id = ?', [passTypeId]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                if (row["isNight"] === null) {
                    return false;
                } else {
                    return (Number.parseInt(row["isNight"]) > 0);
                }
            }
        }
        return false;
    }

    /**
     * Vrai si le type de billet existe
     * @param passTypeId
     */
    async doesPassTypeExist(passTypeId: number): Promise<boolean> {
        const isTreatmentValid = await this.connection.query(`SELECT pass_type_id FROM PASS_TYPE WHERE pass_type_id = ${passTypeId}`);
        const result = isTreatmentValid[0] as RowDataPacket[];
        return result.length > 0;
    }

    /**
     * suppression d'un accès à un espace pour un type de billet
     * @param passTypeId
     * @param spaceId
     */
    async removeAccessForPassTypeAtSpace(passTypeId: number, spaceId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM GIVE_ACCESS_PASS_TYPE_SPACE where pass_type_id = ${passTypeId} and space_id = ${spaceId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

}