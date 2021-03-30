import {ISpeciesProps,SpeciesModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";


interface SpeciesGetAllOptions {
    limit?: number;
    offset?: number;
}


export class SpeciesController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de toutes les espèces
     * @param options -> Limit et offset de la requete
     */
    async getAllSpecies(options?: SpeciesGetAllOptions): Promise<SpeciesModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des utilisateurs
        const res = await this.connection.query(`SELECT species_id, species_name 
                                                    FROM SPECIES LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new SpeciesModel({
                    id: Number.parseInt(row["species_id"]),
                    name: row["species_name"],
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id de l'espèce maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxSpeciesId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(species_id) as maxId FROM SPECIES');
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                if(row["maxId"] === null) {
                    return 0;
                }
                else {
                    return row["maxId"];
                }
            }
        }
        return 0;
    }

    /**
     * Récupération d'une espèce via :
     * @param userId
     */
    async getSpeciesById(userId: number | undefined): Promise<SpeciesModel | null> {
        //récupération de l'utilisateur
        if(userId === undefined)
            return null;

        const res = await this.connection.query(`SELECT species_id, species_name 
                                                    FROM SPECIES where species_id = ${userId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new SpeciesModel({
                    id: Number.parseInt(row["species_id"]),
                    name: row["species_name"],
                });
            }
        }
        return null;
    }

    /**
     * Récupération d'une espèce via :
     * @param mail
     * @param password -> non haché
     */
    async getSpeciesByName(name:string): Promise<SpeciesModel | null> {

        //récupération de l'utilisateur
        const res = await this.connection.query(`SELECT species_id, species_name 
                                                    FROM SPECIES where species_name = ${name}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new SpeciesModel({
                    id: Number.parseInt(row["species_id"]),
                    name: row["species_name"],
                });
            }
        }
        return null;
    }

    /**
     * Suppression d'une espèce depuis son :
     * @param speciesId
     */
    async removeSpeciesById(speciesId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM SPECIES where species_id  = ${speciesId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'une espèce renseignées dans les options
     * @param options -> id: ni
     */
    async updateSpecies(options: ISpeciesProps): Promise<SpeciesModel | null> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.id !== undefined) {
            setClause.push("species_id = ?");
            params.push(options.id);
        }
        if (options.name !== undefined) {
            setClause.push("species_name = ?");
            params.push(options.name);
        }
        try {
            const res = await this.connection.execute(`UPDATE SPECIES SET ${setClause.join(", ")}`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getSpeciesById(options.id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async createSpecies(options: ISpeciesProps): Promise<SpeciesModel | null> {
        try {
            const res = await this.connection.execute("INSERT INTO SPECIES (species_id,species_name) VALUES (?,?)",[
                options.id,
                options.name
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getSpeciesById(options.id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

}