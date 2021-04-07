import {ITreatmentTypeProps, TreatmentTypeModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";

interface TreatmentTypeGetAllOptions {
    limit?: number;
    offset?: number;
}

export class TreatmentTypeController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de tous les types de traitement
     * @param options -> Limit et offset de la requete
     */
    async getAllTreatmentType(options?: TreatmentTypeGetAllOptions): Promise<TreatmentTypeModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des types de traitement
        const res = await this.connection.query(`SELECT treatment_type_id, treatment_type_libelle 
                                                    FROM TREATMENT_TYPE LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new TreatmentTypeModel({
                    treatment_type_id: Number.parseInt(row["treatment_type_id"]),
                    treatment_type_libelle: row["treatment_type_libelle"],
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id du type de traitement maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxtreatment_type_id(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(treatment_type_id) as maxId FROM TREATMENT_TYPE');
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
     * Récupération d'un type de traitement via :
     * @param treatment_type_id
     */
    async getTreatmentTypeById(treatment_type_id: number | undefined): Promise<TreatmentTypeModel | null> {
        if (treatment_type_id === undefined)
            return null;

        const res = await this.connection.query(`SELECT treatment_type_id, treatment_type_libelle 
                                                    FROM TREATMENT_TYPE where treatment_type_id = ${treatment_type_id}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new TreatmentTypeModel({
                    treatment_type_id: Number.parseInt(row["treatment_type_id"]),
                    treatment_type_libelle: row["treatment_type_libelle"],
                });
            }
        }
        return null;
    }

    /**
     * Récupération d'un type de traitement via :
     * @param treatment_type_libelle
     */
    async getTreatmentTypeByName(treatment_type_libelle: string): Promise<TreatmentTypeModel | null> {

        //récupération de l'utilisateur
        const res = await this.connection.query(`SELECT treatment_type_id, treatment_type_libelle 
                                                    FROM TREATMENT_TYPE where treatment_type_libelle = "${treatment_type_libelle}"`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new TreatmentTypeModel({
                    treatment_type_id: Number.parseInt(row["treatment_type_id"]),
                    treatment_type_libelle: row["treatment_type_libelle"],
                });
            }
        }
        return null;
    }

    /**
     * Suppression d'un type de traitement depuis son :
     * @param treatment_type_id
     */
    async removeTreatmentTypeById(treatment_type_id: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM TREATMENT_TYPE where treatment_type_id = ${treatment_type_id}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'un type de traitement renseignées dans les options
     * @param options
     */
    async updateTreatmentType(options: ITreatmentTypeProps): Promise<TreatmentTypeModel | null> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.treatment_type_libelle !== undefined) {
            setClause.push("treatment_type_treatment_type_libelle = ?");
            params.push(options.treatment_type_libelle);
        }
        params.push(options.treatment_type_id);
        try {
            const res = await this.connection.execute(`UPDATE TREATMENT_TYPE SET ${setClause.join(", ")} WHERE treatment_type_id = ?`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getTreatmentTypeById(options.treatment_type_id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * création d'un type de traitement
     * @param options
     */
    async createTreatmentType(options: ITreatmentTypeProps): Promise<TreatmentTypeModel | null> {
        try {
            const res = await this.connection.execute("INSERT INTO TREATMENT_TYPE (treatment_type_id,treatment_type_libelle) VALUES (?,?)", [
                options.treatment_type_id,
                options.treatment_type_libelle
            ]);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getTreatmentTypeById(options.treatment_type_id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    /**
     * Vrai si le type de traitement existe
     * @param treatmentTypeId
     * @param connection
     */
    public static async doesTreatmentTypeExist(treatmentTypeId: number | undefined,connection: Connection) {
        const isTreatmentValid = await connection.query(`SELECT treatment_type_id
    FROM TREATMENT_TYPE WHERE treatment_type_id = ${treatmentTypeId}`);
        const result = isTreatmentValid[0] as RowDataPacket[];
        return result.length > 0;
    }


}