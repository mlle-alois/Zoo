import {IAnimalProps, AnimalModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";


interface AnimalGetAllOptions {
    limit?: number;
    offset?: number;
}

// TODO décommenter les champs space une fois le CRUD space mit en place
export class AnimalController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de toutes les animaux
     * @param options -> Limit et offset de la requete
     */
    async getAllAnimal(options?: AnimalGetAllOptions): Promise<AnimalModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des utilisateurs
        const res = await this.connection.query(`SELECT animal_id, animal_name, animal_age, species_id, space_id 
                                                    FROM ANIMAL LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new AnimalModel({
                    id: Number.parseInt(row["animal_id"]),
                    name: row["animal_name"],
                    age: row["animal_age"],
                    speciesId: Number.parseInt(row["species_id"]),
                    // space: row["space_id"]
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id de l'animal maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxAnimalId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(animal_id) as maxId FROM ANIMAL');
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
     * Récupération d'un animal via :
     * @param animalId
     */
    async getAnimalById(animalId: number | undefined): Promise<AnimalModel | null> {
        //récupération de l'utilisateur
        if(animalId === undefined)
            return null;

        const res = await this.connection.query(`SELECT animal_id, animal_name, animal_age, species_id, space_id
                                                    FROM ANIMAL where animal_id = ${animalId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new AnimalModel({
                    id: Number.parseInt(row["animal_id"]),
                    name: row["animal_name"],
                    age: row["animal_age"],
                    speciesId: Number.parseInt(row["species_id"]),
                    // space: row["space_id"]
                });
            }
        }
        return null;
    }

    /**
     * Récupération d'un animal via :
     * @param name
     */
    async getAnimalByName(name:string): Promise<AnimalModel | null> {

        //récupération de l'utilisateur
        const res = await this.connection.query(`SELECT animal_id, animal_name, animal_age, species_id, space_id 
                                                    FROM ANIMAL where animal_name = ${name}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new AnimalModel({
                    id: Number.parseInt(row["animal_id"]),
                    name: row["animal_name"],
                    age: row["animal_age"],
                    speciesId: Number.parseInt(row["species_id"]),
                    // space: row["space_id"]
                });
            }
        }
        return null;
    }

    /**
     * Suppression d'un animal depuis son :
     * @param animalId
     */
    async removeAnimalById(animalId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM ANIMAL where animal_id  = ${animalId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'un animal renseignées dans les options
     * @param id
     * @param name
     * @param age
     */
    async updateAnimal(id: number, name: string, age: number): Promise<AnimalModel | null> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (id !== undefined) {
            setClause.push("animal_id = ?");
            params.push(id);
        }
        if (name !== undefined) {
            setClause.push("animal_name = ?");
            params.push(name);
        }
        if (age !== undefined) {
            setClause.push("animal_age = ?");
            params.push(age);
        }
        // if (options.space !== undefined) {
        //     setClause.push("space_id = ?");
        //     params.push(options.space);
        // }
        try {
            const res = await this.connection.execute(`UPDATE ANIMAL SET ${setClause.join(", ")}`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getAnimalById(id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async createAnimal(options: IAnimalProps): Promise<AnimalModel | null> {
        try {
            const res = await this.connection.execute(
                "INSERT INTO ANIMAL (animal_id, animal_name, animal_age, species_id, space_id) VALUES (?,?,?,?,?)",
                [
                    options.id,
                    options.name,
                    options.age,
                    options.speciesId,
                    // options.space
                ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getAnimalById(options.id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

}