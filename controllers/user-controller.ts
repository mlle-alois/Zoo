import {UserModel} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {compare, hash} from "bcrypt";

interface UserGetAllOptions {
    limit?: number;
    offset?: number;
}

interface UserUpdateOptions {
    userId: number;
    mail?: string;
    password?: string;
    name?: string;
    firstname?: string;
    phoneNumber?: string;
    typeId?: number;
}

export class UserController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de tous les utilisateurs
     * @param options -> Limit et offset de la requete
     */
    async getAllUsers(options?: UserGetAllOptions): Promise<UserModel[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        //récupération des utilisateurs
        const res = await this.connection.query(`SELECT user_id, user_mail, user_password, user_name, user_firstname, user_phone_number, user_type_id 
                                                    FROM USER LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new UserModel({
                    userId: Number.parseInt(row["user_id"]),
                    mail: row["user_mail"],
                    password: row["user_password"],
                    firstname: row["user_firstname"],
                    name: row["user_name"],
                    phoneNumber: row["user_phone_number"],
                    typeId: row["user_type_id"]
                });
            });
        }
        return [];
    }

    /**
     * Récupération de l'id d'utilisateur maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxUserId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(user_id) as maxId FROM USER');
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
     * Récupération d'un utilisateur depuis son :
     * @param userId
     */
    async getUserById(userId: number): Promise<UserModel | null> {
        //récupération de l'utilisateur
        const res = await this.connection.query(`SELECT user_id, user_mail, user_password, user_name, user_firstname, user_phone_number, user_type_id 
                                                    FROM USER where user_id = ${userId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new UserModel({
                    userId: Number.parseInt(row["user_id"]),
                    mail: row["user_mail"],
                    password: row["user_password"],
                    firstname: row["user_firstname"],
                    name: row["user_name"],
                    phoneNumber: row["user_phone_number"],
                    typeId: row["user_type_id"]
                });
            }
        }
        return null;
    }

    /**
     * Récupération d'un utilisateur via :
     * @param mail
     * @param password -> non haché
     */
    async getUserByMailAndPassword(mail: string, password: string): Promise<UserModel | null> {
        const res = await this.connection.query(`SELECT user_id, user_mail, user_password, user_name, user_firstname, user_phone_number, user_type_id 
                                                    FROM USER where user_mail = ?`, [
            mail
        ]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                const isSamePassword = await compare(password, row["user_password"]);
                if(!isSamePassword) {
                    return null;
                }
                return new UserModel({
                    userId: Number.parseInt(row["user_id"]),
                    mail: row["user_mail"],
                    password: row["user_password"],
                    firstname: row["user_firstname"],
                    name: row["user_name"],
                    phoneNumber: row["user_phone_number"],
                    typeId: row["user_type_id"]
                });
            }
        }
        return null;
    }

    /**
     * Suppression d'un utilisateur depuis son :
     * @param userId
     */
    async deleteUserById(userId: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM USER WHERE user_id = ${userId}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Modification des informations d'un utilisateur renseignées dans les options
     * @param options -> informations à modifier
     */
    async updateUser(options: UserUpdateOptions): Promise<UserModel | null> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.mail !== undefined) {
            setClause.push("user_mail = ?");
            params.push(options.mail);
        }
        if (options.password !== undefined) {
            setClause.push("user_password = ?");
            const hachedPassword = await hash(options.password, 5);
            params.push(hachedPassword);
        }
        if (options.name !== undefined) {
            setClause.push("user_name = ?");
            params.push(options.name);
        }
        if (options.firstname !== undefined) {
            setClause.push("user_firstname = ?");
            params.push(options.firstname);
        }
        if (options.phoneNumber !== undefined) {
            setClause.push("user_phone_number = ?");
            params.push(options.phoneNumber);
        }
        if (options.typeId !== undefined) {
            setClause.push("user_type_id = ?");
            params.push(options.typeId);
        }
        params.push(options.userId);
        try {
            const res = await this.connection.execute(`UPDATE USER SET ${setClause.join(", ")} WHERE user_id = ?`, params);
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getUserById(options.userId);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

}