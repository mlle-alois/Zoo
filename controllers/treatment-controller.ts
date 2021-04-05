import {ITreatmentProps, TreatmentModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {DateHelp} from "../Utils";
import {AnimalController} from "./animals-controller"
import {TreatmentTypeController} from "./treatment-type-controller";
import {UserController} from "./user-controller";


interface TreatmentGetAllOptions {
    limit?: number;
    offset?: number;
}


export class TreatmentController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de toutes les présences
     * @param options -> Limit et offset de la requete
     */
    async getAllTreatment(options?: TreatmentGetAllOptions): Promise<TreatmentModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des présences
        const res = await this.connection.query(`SELECT treatment_id, treatment_date, treatment_observation,animal_id,treatment_type_id, veterinary_id
                                                    FROM TREATMENT LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new TreatmentModel({
                    treatment_id: Number.parseInt(row["treatment_id"]),
                    treatment_date: row["treatment_date"],
                    treatment_observation: row["treatment_observation"],
                    animal_id: row["animal_id"],
                    treatment_type_id: row["treatment_type_id"],
                    veterinary_id: row["veterinary_id"]
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id de l'présence maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxTreatmentId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(treatment_id) as maxId FROM TREATMENT');
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
     * Récupération d'un traitement via :
     * @param TreatmentId
     */
    async getTreatmentById(TreatmentId: number | undefined): Promise<TreatmentModel | null> {
        if (TreatmentId === undefined)
            return null;

        const res = await this.connection.query(`SELECT treatment_id, treatment_date, treatment_observation,animal_id,treatment_type_id, veterinary_id
                                                    FROM TREATMENT where treatment_id = ${TreatmentId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new TreatmentModel({
                    treatment_id: Number.parseInt(row["treatment_id"]),
                    treatment_date: row["treatment_date"],
                    treatment_observation: row["treatment_observation"],
                    animal_id: row["animal_id"],
                    treatment_type_id: row["treatment_type_id"],
                    veterinary_id: row["veterinary_id"]
                });
            }
        }
        return null;
    }

    /**
     * Récupération d'une liste de traitements d'un animal via :
     * @param animalId
     */
    async getTreatmentByAnimalId(animalId: number | undefined): Promise<TreatmentModel[] | null> {
        if (animalId === undefined)
            return null;

        const res = await this.connection.query(`SELECT treatment_id, treatment_date, treatment_observation,animal_id,treatment_type_id, veterinary_id
                                                    FROM TREATMENT where animal_id = ${animalId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new TreatmentModel({
                    treatment_id: Number.parseInt(row["treatment_id"]),
                    treatment_date: row["treatment_date"],
                    treatment_observation: row["treatment_observation"],
                    animal_id: row["animal_id"],
                    treatment_type_id: row["treatment_type_id"],
                    veterinary_id: row["veterinary_id"]
                });
            });
        }
        return [];
    }

    /**
     * Récupération de toutes les Treatments d'un veto via :
     * @param VeterinaryId
     */
    async getTreatmentByVeterinary(VeterinaryId: number): Promise<TreatmentModel[] | null> {

        //récupération de l'présence
        const res = await this.connection.query(`SELECT treatment_id, treatment_date, treatment_observation,animal_id,treatment_type_id, veterinary_id
                                                    FROM TREATMENT where veterinary_id = ${VeterinaryId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new TreatmentModel({
                    treatment_id: Number.parseInt(row["treatment_id"]),
                    treatment_date: row["treatment_date"],
                    treatment_observation: row["treatment_observation"],
                    animal_id: row["animal_id"],
                    treatment_type_id: row["treatment_type_id"],
                    veterinary_id: row["veterinary_id"]
                });
            });
        }
        return [];
    }

    /**
     * Suppression d'un traitement par id depuis son :
     * @param TreatmentId
     */
    async removeTreatmentById(TreatmentId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM TREATMENT where treatment_id  = ${TreatmentId}`);
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
    async updateTreatment(options: ITreatmentProps): Promise<TreatmentModel | null | string> {


        const setClause: string[] = [];
        const params = [];

        //création des contenus de la requête dynamiquement
        if (options.treatment_date !== undefined) {
            setClause.push("treatment_date = ?");
            params.push(options.treatment_date);
        } else {
            setClause.push("treatment_date = ?");
            params.push(DateHelp.getCurrentTimeStamp());
        }
        if (options.treatment_observation !== undefined) {
            setClause.push("treatment_observation = ?");
            params.push(options.treatment_observation);
        }
        if (options.animal_id !== undefined) {
            if (!await AnimalController.doesAnimalExist(options.animal_id, this.connection))
                return "The animal doesn't exist";
            setClause.push("animal_id = ?");
            params.push(options.animal_id);
        }
        if (options.treatment_type_id !== undefined) {
            if (!await TreatmentTypeController.doesTreatmentTypeExist(options.treatment_type_id, this.connection))
                return "The treatment type doesn't exist";
            setClause.push("treatment_type_id = ?");
            params.push(options.treatment_type_id);
        }
        if (options.veterinary_id !== undefined) {
            if (!await UserController.doesVeterinaryExist(options.veterinary_id, this.connection))
                return "The veterinary doesn't exist";
            setClause.push("veterinary_id = ?");
            params.push(options.veterinary_id);
        }
        params.push(options.treatment_id);
        try {
            const res = await this.connection.execute(`UPDATE TREATMENT SET ${setClause.join(", ")} WHERE treatment_id = ?`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getTreatmentById(options.treatment_id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }


    /**
     * création d'un traitement en vérifiant si c'est possible
     * @param options
     *
     */
    async createTreatment(options: ITreatmentProps): Promise<TreatmentModel | null | string> {
        try {
            if (!await UserController.doesVeterinaryExist(options.veterinary_id, this.connection))
                return "The veterinary doesn't exist";
            if (!await AnimalController.doesAnimalExist(options.animal_id, this.connection))
                return "The animal doesn't exist";
            if (!await TreatmentTypeController.doesTreatmentTypeExist(options.treatment_type_id, this.connection))
                return "The treatment type doesn't exist";

            const res = await this.connection.execute("INSERT INTO TREATMENT (treatment_id, treatment_date, treatment_observation,animal_id,treatment_type_id, veterinary_id) VALUES (?,?,?,?,?,?)", [
                options.treatment_id,
                options.treatment_date,
                options.treatment_observation,
                options.animal_id,
                options.treatment_type_id,
                options.veterinary_id
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getTreatmentById(options.treatment_id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }

    }


}