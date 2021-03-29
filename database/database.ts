import {createConnection, Connection} from 'mysql2/promise';

export class DatabaseUtils {

    private static connection?: Connection;

    static async getConnexion(): Promise<Connection> {
        if (!DatabaseUtils.connection) {
            DatabaseUtils.connection = await createConnection({
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                port: Number.parseInt(process.env.DB_PORT as string)
            });
        }
        return DatabaseUtils.connection;
    }

}