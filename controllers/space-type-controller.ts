import {ISpaceTypeProps, SpaceTypeModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";

interface SpaceTypeGetAllOptions {
    limit?: number;
    offset?: number;
}

export class SpaceTypeController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de tous les types d'espaces
     * @param options -> Limit et offset de la requete
     */
    async getAllSpaceType(options?: SpaceTypeGetAllOptions): Promise<SpaceTypeModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des types d'espaces
        const res = await this.connection.query(`SELECT space_type_id, space_type_libelle 
                                                    FROM SPACE_TYPE LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new SpaceTypeModel({
                    idSpaceType: Number.parseInt(row["space_type_id"]),
                    libelle: row["space_type_libelle"],
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id du type d'espace maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxSpaceTypeId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(space_type_id) as maxId FROM SPACE_TYPE');
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
     * Récupération d'un type d'espace via :
     * @param spaceTypeId
     */
    async getSpaceTypeById(spaceTypeId: number | undefined): Promise<SpaceTypeModel | null> {
        if (spaceTypeId === undefined)
            return null;

        const res = await this.connection.query(`SELECT space_type_id, space_type_libelle 
                                                    FROM SPACE_TYPE where space_type_id = ${spaceTypeId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new SpaceTypeModel({
                    idSpaceType: Number.parseInt(row["space_type_id"]),
                    libelle: row["space_type_libelle"],
                });
            }
        }
        return null;
    }

    /**
     * Récupération d'un type d'espace via :
     * @param libelle
     */
    async getSpaceTypeByName(libelle: string): Promise<SpaceTypeModel | null> {

        //récupération de l'utilisateur
        const res = await this.connection.query(`SELECT space_type_id, space_type_libelle 
                                                    FROM SPACE_TYPE where space_type_libelle = ${libelle}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new SpaceTypeModel({
                    idSpaceType: Number.parseInt(row["space_type_id"]),
                    libelle: row["space_type_libelle"],
                });
            }
        }
        return null;
    }

    /**
     * Suppression d'un type d'espace depuis son :
     * @param spaceTypeId
     */
    async removeSpaceTypeById(spaceTypeId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM SPACE_TYPE where space_type_id = ${spaceTypeId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'un type d'espace renseignées dans les options
     * @param options
     */
    async updateSpaceType(options: ISpaceTypeProps): Promise<SpaceTypeModel | null> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.idSpaceType !== undefined) {
            setClause.push("space_type_id = ?");
            params.push(options.idSpaceType);
        }
        if (options.libelle !== undefined) {
            setClause.push("space_type_libelle = ?");
            params.push(options.libelle);
        }
        try {
            const res = await this.connection.execute(`UPDATE SPACE_TYPE SET ${setClause.join(", ")}`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getSpaceTypeById(options.idSpaceType);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * création d'un type d'espace
     * @param options
     */
    async createSpaceType(options: ISpaceTypeProps): Promise<SpaceTypeModel | null> {
        try {
            const res = await this.connection.execute("INSERT INTO SPACE_TYPE (space_type_id,space_type_libelle) VALUES (?,?)", [
                options.idSpaceType,
                options.libelle
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getSpaceTypeById(options.idSpaceType);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

}