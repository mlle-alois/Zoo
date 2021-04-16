import {
    AssociateSpaceMediaModel,
    IAssociateSpaceMediaProps,
    ISpaceProps, IVisitSpacePassHourModelProps,
    LogError, PassModel,
    SpaceModel, VisitSpacePassHourModel
} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {MediaController} from "./media-controller";

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
    async getSpaceById(spaceId: number | undefined): Promise<SpaceModel | LogError> {
        if (spaceId === undefined)
            return new LogError({numError: 400, text: "There is no space id"});

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
        return new LogError({numError: 404, text: "Space not found"});
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
    async updateSpace(options: ISpaceProps): Promise<SpaceModel | LogError> {
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
            return new LogError({numError: 400, text: "The space update failed"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "The space update failed"});
        }
    }

    /**
     * création d'un espace
     * @param options
     */
    async createSpace(options: ISpaceProps): Promise<SpaceModel | LogError> {
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
            return new LogError({numError: 400, text: "Couldn't create pass"});
        } catch (err) {
            console.error(err);
            return new LogError({numError: 400, text: "Couldn't create pass"});
        }
    }

    /**
     * Vrai si l'espace existe
     * @param spaceId
     * @param connection
     */
    public static async  doesSpaceExist(spaceId: number,connection:Connection): Promise<boolean> {
        const isTreatmentValid = await connection.query(`SELECT space_id FROM SPACE WHERE space_id = ${spaceId}`);
        const result = isTreatmentValid[0] as RowDataPacket[];
        return result.length > 0;
    }

    /**
     *Ajout d'un media pour un espace
     * @param options
     */
    async addMediaToSpace(options: IAssociateSpaceMediaProps): Promise<AssociateSpaceMediaModel | LogError> {
        if (options.space_id  === undefined || options.media_id === undefined) {
            return new LogError({numError:400,text:"Enter a mediaId and a spaceId"});
        }
        if(!await SpaceController.doesSpaceExist(options.space_id,this.connection)){
            return new LogError({numError:404,text:"this spaceId doesn't exist"});
        }
        if(!await MediaController.doesMediaExist(options.media_id,this.connection)){
            return new LogError({numError:404,text:"this mediaID doesn't exist"});
        }

        try {
            const res = await this.connection.execute("INSERT INTO ASSOCIATE_SPACE_MEDIA (media_id, space_id) VALUES (?, ?)", [
                options.media_id,
                options.space_id,
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getAssociateSpaceMedia(options);
            }
            return new LogError({numError:400,text:"Couldn't add Media to Space"});
        } catch (err) {
            console.error(err);
            return new LogError({numError:400,text:"Couldn't add Media to Space"});
        }
    }

    /**
     * Récupère le media associé à l'espace
     * @param options
     */
    async getAssociateSpaceMedia(options: IAssociateSpaceMediaProps): Promise<AssociateSpaceMediaModel | LogError> {
        if (options.space_id === undefined || options.media_id === undefined)
            return new LogError({numError:400,text:"There is no mediaId or spaceId"});

        try {
            const res = await this.connection.query(`SELECT media_id,space_id
                                                    FROM ASSOCIATE_SPACE_MEDIA where media_id = ${options.media_id} AND space_id = ${options.space_id}`);

            const data = res[0];
            if (Array.isArray(data)) {
                const rows = data as RowDataPacket[];
                if (rows.length > 0) {
                    const row = rows[0];
                    return new AssociateSpaceMediaModel({
                        media_id: Number.parseInt(row["media_id"]),
                        space_id: row["space_id"],
                    });
                }
            }
            return new LogError({numError:400,text:"No entry found"});
        } catch (err) {
            console.error(err);
            return new LogError({numError:400,text:"no entry found"});
        }
    }

    /**
     * Récupère la liste de tous les médias associés à l'espace
     * @param spaceId
     * @param options2
     */
    async getAllAssociateSpaceMedia(spaceId:number,options2?:SpaceGetAllOptions): Promise<AssociateSpaceMediaModel[] | LogError> {
        if (spaceId === undefined)
            return new LogError({numError:400,text:"There is no spaceId"});

        if(!await SpaceController.doesSpaceExist(spaceId,this.connection)){
            return new LogError({numError:404,text:"this spaceId doesn't exist"});
        }

        //récupération des options
        const limit = options2?.limit || 20;
        const offset = options2?.offset || 0;

        try {
            const res = await this.connection.query(`SELECT media_id,space_id
                                                    FROM ASSOCIATE_SPACE_MEDIA where space_id = ${spaceId} LIMIT ${offset}, ${limit}`);

            const data = res[0];
            if (Array.isArray(data)) {
                return (data as RowDataPacket[]).map(function (row: any) {
                    return new AssociateSpaceMediaModel({
                        media_id: Number.parseInt(row["media_id"]),
                        space_id: row["space_id"],
                    });
                });
            }
            return new LogError({numError:400,text:"No entry found"});
        } catch (err) {
            console.error(err);
            return new LogError({numError:400,text:"no entry found"});
        }
    }

    /**
     * Suppression d'une association d'un média lié à l'espace :
     * @param mediaId
     * @param spaceId
     */
    async removeAssociatedMediaBySpaceId(mediaId:number,spaceId: number): Promise<boolean | LogError> {
        if (spaceId  === undefined || mediaId === undefined) {
            return new LogError({numError:400,text:"Enter a mediaId and a spaceId"});
        }
        if(!await SpaceController.doesSpaceExist(spaceId,this.connection)){
            return new LogError({numError:404,text:"this spaceId doesn't exist"});
        }
        if(!await MediaController.doesMediaExist(mediaId,this.connection)){
            return new LogError({numError:404,text:"this mediaId doesn't exist"});
        }
        try {
            const res = await this.connection.query(`DELETE FROM ASSOCIATE_SPACE_MEDIA where media_id = ${mediaId} AND space_id = ${spaceId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
             return new LogError({numError:403,text:"Delete failed"});
        }
    }

    /**
     * Vrai si le pass a déjà visité l'espace aujourd'hui
     * @param pass
     * @param space
     */
    async spaceWasVisitedByPassToday(pass: PassModel, space: SpaceModel): Promise<boolean> {
        const res = await this.connection.query(`SELECT pass_id, date_hour_enter, space_id, date_hour_exit
                                                    FROM VISIT_SPACE_PASS_HOUR 
                                                    WHERE pass_id = ${pass.passId}
                                                    AND space_id = ${space.spaceId}
                                                    AND DAY(date_hour_enter) = DAY(NOW())
                                                    AND MONTH(date_hour_enter) = MONTH(NOW())
                                                    AND YEAR(date_hour_enter) = YEAR(NOW())
                                                    ORDER BY date_hour_enter DESC 
                                                    LIMIT 1`);
        const data = res[0];
        return (Array.isArray(data) && (data as RowDataPacket[]).length > 0);
    }

}