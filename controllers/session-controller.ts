import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {UserController} from "./user-controller";
import {UserModel} from "../models/user-model";
import {SessionModel} from "../models/session-model";

export class SessionController {

    private connection: Connection;
    private userController: UserController;

    constructor(connection: Connection) {
        this.connection = connection;
        this.userController = new UserController(this.connection);
    }

    /**
     * Récupération de l'id de session maximum existant
     * Utile pour l'incrémentation manuelle
     */
    async getMaxSessionId(): Promise<number> {
        const res = await this.connection.query('SELECT MAX(session_id) as maxId FROM SESSION');
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
     * Récupération d'une session depuis le token
     * @param token
     */
    async getSessionByToken(token: string): Promise<SessionModel | null> {
        //récupération de la session
        const res = await this.connection.query(`SELECT session_id, token, createdAt, updatedAt, deletedAt, user_id 
                                                    FROM SESSION where token = ?`, [
            token
        ]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new SessionModel({
                    sessionId: Number.parseInt(row["session_id"]),
                    token: row["token"],
                    createdAt: row["createdAt"],
                    updatedAt: row["updatedAt"],
                    deletedAt: row["deletedAt"],
                    userId: row["user_id"]
                });
            }
        }
        return null;
    }

    /**
     * Création d'une session
     * @param sessionId
     * @param token
     * @param userId
     */
    async createSession(sessionId: number, token: string, userId: number): Promise<SessionModel | null> {
        try {
            //création de la session
            await this.connection.execute(`INSERT INTO SESSION (session_id, token, createdAt, updatedAt, user_id) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`, [
                //incrémentation manuelle
                sessionId,
                token,
                userId
            ]);
            //récupération de la session créée ou null si cela n'a pas fonctionné
            return await this.userController.getUserById(userId);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * récupérations des sessions associées à l'user id
     * @param userId
     */
    async deleteOldSessionsByUserId(userId: number): Promise<boolean> {
        try {
            //suppression de la session
            const res = await this.connection.query(`DELETE FROM SESSION WHERE user_id = ?`, [
                userId
            ]);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Suppression d'une session depuis le token
     * @param token
     */
    async deleteSessionByToken(token: string): Promise<boolean | null> {
        try {
            //suppression de la session
            const res = await this.connection.query(`DELETE FROM SESSION WHERE token = ?`, [
                token
            ]);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

}