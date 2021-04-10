import {IMediaProps, LogError, MediaModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";


interface MediaGetAllOptions {
    limit?: number;
    offset?: number;
}


export class MediaController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de tous les medias
     * @param options -> Limit et offset de la requete
     */
    async getAllMedia(options?: MediaGetAllOptions): Promise<MediaModel[] | LogError> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des medias
        const res = await this.connection.query(`SELECT media_id, media_path
                                                    FROM MEDIA LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new MediaModel({
                    media_id: Number.parseInt(row["media_id"]),
                    media_path: row["media_path"],
                });
            });
        }
        return new LogError({numError:404,text:"Media not found"});
    }

    /**
     * Récupération de l'id du media maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxMediaId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(media_id) as maxId FROM MEDIA');
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
     * Récupération d'un media via :
     * @param mediaId
     */
    async getMediaById(mediaId: number): Promise<MediaModel|LogError> {
        if (mediaId === undefined)
            return new LogError({numError:400,text:"There is no Media id"});

        const res = await this.connection.query(`SELECT media_id, media_path
                                                    FROM MEDIA where media_id = ${mediaId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new MediaModel({
                    media_id: Number.parseInt(row["media_id"]),
                    media_path: row["media_path"],
                });
            }
        }
        return new LogError({numError:404,text:"Media not found"});
    }

    /**
     * Récupération d'une liste de medias lié à un path via :
     * @param media_path
     */
    async getMediaByPath(media_path: string | undefined): Promise<MediaModel[] | LogError> {
        if (media_path === undefined)
            return new LogError({numError:404,text:"Media not found"});

        const res = await this.connection.query(`SELECT media_id, media_path
                                                    FROM MEDIA where media_path = "${media_path}"`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new MediaModel({
                    media_id: Number.parseInt(row["media_id"]),
                    media_path: row["media_path"]
                });
            });
        }
        return new LogError({numError:404,text:"Media not found"});
    }


    /**
     * Suppression d'un media par id depuis son :
     * @param mediaId
     */
    async removeMediaById(mediaId: number): Promise<boolean | LogError> {
        if(!await MediaController.doesMediaExist(mediaId,this.connection)){
            return new LogError({numError:404,text:"this mediaId doesn't exist"});
        }
        try {
            const res = await this.connection.query(`DELETE FROM MEDIA where media_id  = ${mediaId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
             return new LogError({numError:403,text:"Delete failed"});
        }
    }

    /**
     * Modification des informations d'un media renseigné dans les options
     * @param options
     */
    async updateMedia(options: IMediaProps): Promise<MediaModel | LogError> {


        const setClause: string[] = [];
        const params = [];

        //création des contenus de la requête dynamiquement

        if (options.media_path !== undefined) {
            setClause.push("media_path = ?");
            params.push(options.media_path);
        }
        params.push(options.media_id);
        try {
            const res = await this.connection.execute(`UPDATE MEDIA SET ${setClause.join(", ")} WHERE media_id = ?`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getMediaById(options.media_id);
            }
            return new LogError({numError:400,text:"The Media update failed"});

        } catch (err) {
            console.error(err);
            return new LogError({numError:400,text:"The Media update failed"});
        }

    }


    /**
     * création d'un media en vérifiant si c'est possible
     * @param options
     *
     */
    async createMedia(options: IMediaProps): Promise<MediaModel | LogError> {
        try {

            const res = await this.connection.execute("INSERT INTO MEDIA (media_id, media_path) VALUES (?,?)", [
                options.media_id,
                options.media_path,
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getMediaById(options.media_id);
            }
            return new LogError({numError:400,text:"Couldn't create Media"});
        } catch (err) {
            console.error(err);
            return new LogError({numError:400,text:"Couldn't create Media"});
        }

    }

    static async doesMediaExist(mediaId: number,connection:Connection): Promise<boolean> {
        const isTreatmentValid = await connection.query(`SELECT media_id FROM MEDIA WHERE media_id = ${mediaId}`);
        const result = isTreatmentValid[0] as RowDataPacket[];
        return result.length > 0;
    }



}