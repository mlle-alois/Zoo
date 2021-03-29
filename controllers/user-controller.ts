import {UserModel} from "../models/user-model";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";

interface UserGetAllOptions {
    limit?: number;
    offset?: number;
}

interface UserUpdateOptions {
    id: string;
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

    async getAll(options?: UserGetAllOptions): Promise<UserModel[]> {
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        const res = await this.connection.query(`SELECT user_id, user_mail, user_password, user_name, user_firstname, user_phone_number, user_type_id 
                                                    FROM USER LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new UserModel({
                    userId: row["user_id"],
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

    async getMaxId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(user_id) as maxId FROM USER'); // escape pour éviter les injections SQL
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

    async getById(id: string): Promise<UserModel | null> {
        const res = await this.connection.query(`SELECT user_id, user_mail, user_password, user_name, user_firstname, user_phone_number, user_type_id 
                                                    FROM USER where user_id = ${escape(id)}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new UserModel({
                    userId: row["user_id"],
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

    //TODO adapter à user
    /*async create(casino: ICasinoProps): Promise<CasinoModel | null> {
        try {
            const res = await this.connection.execute(`INSERT INTO CASINO (name, capacity, price) VALUES (?, ?, ?)`, [
                casino.name,
                casino.capacity,
                casino.price
            ]);
            const headers = res[0] as ResultSetHeader;

            return new CasinoModel({
                id: "" + headers.insertId,
                ...casino // permet de mettre à plat un objet
                //équivalent à :
                //name: casino.name,
                //capacity: casino.capacity,
                //price: casino.price

                //const copy = {...casino, test: "bonjour"};
                //console.log(copy.test);
            });
        } catch (err) {
            console.error(err); // log dans un fichier c'est mieux
            return null;
        }
    }

    async removeById(id: string): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE FROM CASINO WHERE id = ${escape(id)}`); // escape pour éviter les injections SQL
            const headers = res[0] as ResultSetHeader;
            console.log(headers)
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async update(options: CasinoUpdateOptions): Promise<CasinoModel | null> {
        const setClause: string[] = [];
        const params = [];
        //création des contenus de la requête dynamiquement
        if (options.name !== undefined) {
            setClause.push("name = ?");
            params.push(options.name);
        }
        if (options.capacity !== undefined) {
            setClause.push("capacity = ?");
            params.push(options.capacity);
        }
        if (options.price !== undefined) {
            setClause.push("price = ?");
            params.push(options.price);
        }
        params.push(options.id);
        try {
            const res = await this.connection.execute(`UPDATE CASINO SET ${setClause.join(", ")} WHERE id = ?`, params); //join fusionne les éléments d'un tableau avec un séparateur
            const headers = res[0] as ResultSetHeader;
            if (headers.affectedRows === 1) {
                return this.getById(options.id);
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }*/

}