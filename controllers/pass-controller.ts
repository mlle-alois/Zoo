import {IPassProps, PassModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {AccessPassSpaceModel, IAccessPassSpaceModelProps} from "../models/access-pass-space-model";

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
        const res = await this.connection.query(`SELECT pass_id, pass_name, price, isAvailable 
                                                    FROM PASS LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new PassModel({
                    passId: Number.parseInt(row["pass_id"]),
                    passName: row["pass_name"],
                    price: Number.parseFloat(row["price"]),
                    isAvailable: row["isAvailable"] as boolean
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
    async getPassById(passId: number | undefined): Promise<PassModel | null> {
        if (passId === undefined)
            return null;

        const res = await this.connection.query(`SELECT pass_id, pass_name, price, isAvailable 
                                                    FROM PASS where pass_id = ${passId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new PassModel({
                    passId: Number.parseInt(row["pass_id"]),
                    passName: row["pass_name"],
                    price: Number.parseFloat(row["price"]),
                    isAvailable: row["isAvailable"] as boolean
                });
            }
        }
        return null;
    }

    /**
     * Récupération d'un accès billet via :
     * @param passId
     * @param spaceId
     */
    async getAccessByPassIdAndSpaceId(passId: number | undefined, spaceId: number | undefined): Promise<AccessPassSpaceModel | null> {
        if (passId === undefined || spaceId === undefined)
            return null;

        const res = await this.connection.query(`SELECT pass_id, space_id, num_order_access 
                                                    FROM GIVE_ACCESS_PASS_SPACE WHERE pass_id = ? AND space_id = ?`, [
            passId,
            spaceId
        ]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new AccessPassSpaceModel({
                    passId: Number.parseInt(row["pass_id"]),
                    spaceId: Number.parseInt(row["space_id"]),
                    numOrderAccess: Number.parseInt(row["num_order_access"])
                });
            }
        }
        return null;
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
    async updatePass(options: IPassProps): Promise<PassModel | null> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.passName !== undefined) {
            setClause.push("pass_name = ?");
            params.push(options.passName);
        }
        if (options.price !== undefined) {
            setClause.push("price = ?");
            params.push(options.price);
        }
        if (options.isAvailable !== undefined) {
            setClause.push("isAvailable = ?");
            params.push(options.isAvailable);
        }
        params.push(options.passId);
        try {
            const res = await this.connection.execute(`UPDATE PASS SET ${setClause.join(", ")} WHERE pass_id = ?`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getPassById(options.passId);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * création d'un pass
     * @param options
     */
    async createPass(options: IPassProps): Promise<PassModel | null> {
        try {
            const res = await this.connection.execute("INSERT INTO PASS (pass_id, pass_name, price, isAvailable) VALUES (?, ?, ?, ?)", [
                options.passId,
                options.passName,
                options.price,
                options.isAvailable
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getPassById(options.passId);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * création d'un accès à un espace pour un billet
     * @param options
     */
    async createAccessForPassAtSpace(options: IAccessPassSpaceModelProps): Promise<AccessPassSpaceModel | null> {
        const numOrderAccess = options.numOrderAccess === undefined ? null : options.numOrderAccess;
        try {
            const res = await this.connection.execute("INSERT INTO GIVE_ACCESS_PASS_SPACE (pass_id, space_id, num_order_access) VALUES (?, ?, ?)", [
                options.passId,
                options.spaceId,
                numOrderAccess
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getAccessByPassIdAndSpaceId(options.passId, options.spaceId);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * Savoir si un billet est escape game via son :
     * @param passId
     */
    async isEscapeGamePass(passId: number): Promise<boolean> {
        const res = await this.connection.query('SELECT COUNT(*) as isEscapeGame FROM PASS WHERE UPPER(pass_name) LIKE \'%ESCAPE%GAME%\' AND pass_id = ?', [passId]);
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
     * Vrai si le billet existe
     * @param passId
     */
    async doesPassExist(passId: number) {
        const isTreatmentValid = await this.connection.query(`SELECT pass_id FROM PASS WHERE pass_id = ${passId}`);
        const result = isTreatmentValid[0] as RowDataPacket[];
        return result.length > 0;
    }

    /**
     * création d'un accès à un espace pour un billet
     * @param passId
     * @param spaceId
     */
    async removeAccessForPassAtSpace(passId: number, spaceId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM GIVE_ACCESS_PASS_SPACE where pass_id = ${passId} and space_id = ${spaceId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

}