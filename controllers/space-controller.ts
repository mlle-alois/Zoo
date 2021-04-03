import {ISpaceProps, SpaceModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";

interface SpaceGetAllOptions {
    limit?: number;
    offset?: number;
}

export class SpaceController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de tous les espaces
     * @param options -> Limit et offset de la requete
     */
    async getAllSpace(options?: SpaceGetAllOptions): Promise<SpaceModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des espaces
        const res = await this.connection.query(`SELECT space_id, space_name, space_description, space_capacity, opening_time, closing_time, handicapped_access, space_type_id 
                                                    FROM SPACE LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new SpaceModel({
                    spaceId: Number.parseInt(row["space_id"]),
                    spaceName: row["space_name"],
                    spaceDescription: row["space_description"],
                    spaceCapacity: Number.parseInt(row["space_capacity"]),
                    openingTime: row["opening_time"] as Date,
                    closingTime: row["closing_time"] as Date,
                    handicappedAccess: row["handicapped_access"] as boolean,
                    spaceTypeId: Number.parseInt(row["space_type_id"])
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id de l'espace maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxSpaceId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(space_id) as maxId FROM SPACE');
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
     * Récupération d'un espace via :
     * @param spaceId
     */
    async getSpaceById(spaceId: number | undefined): Promise<SpaceModel | null> {
        if (spaceId === undefined)
            return null;

        const res = await this.connection.query(`SELECT space_id, space_name, space_description, space_capacity, opening_time, closing_time, handicapped_access, space_type_id 
                                                    FROM SPACE where space_id = ${spaceId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new SpaceModel({
                    spaceId: Number.parseInt(row["space_id"]),
                    spaceName: row["space_name"],
                    spaceDescription: row["space_description"],
                    spaceCapacity: Number.parseInt(row["space_capacity"]),
                    openingTime: row["opening_time"] as Date,
                    closingTime: row["closing_time"] as Date,
                    handicappedAccess: row["handicapped_access"] as boolean,
                    spaceTypeId: Number.parseInt(row["space_type_id"])
                });
            }
        }
        return null;
    }

    /**
     * Suppression d'un espace depuis son :
     * @param spaceId
     */
    async removeSpaceById(spaceId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM SPACE where space_id = ${spaceId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'un espace renseignées dans les options
     * @param options
     */
    async updateSpace(options: ISpaceProps): Promise<SpaceModel | null> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.spaceName !== undefined) {
            setClause.push("space_name = ?");
            params.push(options.spaceName);
        }
        if (options.spaceDescription !== undefined) {
            setClause.push("space_description = ?");
            params.push(options.spaceDescription);
        }
        if (options.spaceCapacity !== undefined) {
            setClause.push("space_capacity = ?");
            params.push(options.spaceCapacity);
        }
        if (options.openingTime !== undefined) {
            setClause.push("opening_time = ?");
            params.push(options.openingTime);
        }
        if (options.closingTime !== undefined) {
            setClause.push("closing_time = ?");
            params.push(options.closingTime);
        }
        if (options.handicappedAccess !== undefined) {
            setClause.push("handicapped_access = ?");
            params.push(options.handicappedAccess);
        }
        if (options.spaceTypeId !== undefined) {
            setClause.push("space_type_id = ?");
            params.push(options.spaceTypeId);
        }
        params.push(options.spaceId);
        try {
            const res = await this.connection.execute(`UPDATE SPACE SET ${setClause.join(", ")} WHERE space_id = ?`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getSpaceById(options.spaceId);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * création d'un espace
     * @param options
     */
    async createSpace(options: ISpaceProps): Promise<SpaceModel | null> {
        try {
            const res = await this.connection.execute("INSERT INTO SPACE (space_id, space_name, space_description, space_capacity, opening_time, closing_time, handicapped_access, space_type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                options.spaceId,
                options.spaceName,
                options.spaceDescription,
                options.spaceCapacity,
                options.openingTime,
                options.closingTime,
                options.handicappedAccess,
                options.spaceTypeId
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getSpaceById(options.spaceId);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

}