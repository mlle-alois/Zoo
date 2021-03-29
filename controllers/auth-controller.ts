import {UserModel} from "../models/user-model";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {hash} from "bcrypt";

interface IUserCreationProps {
    userId: number;
    mail: string;
    password: string;
    name: string;
    firstname: string;
    phoneNumber: string;
    typeId: number;
}

export class AuthController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async subscribe(user: IUserCreationProps): Promise<UserModel | null> {
        const passwordHashed = await hash(user.password, 5);
        try {
            const res = await this.connection.execute(`INSERT INTO USER (user_id, user_mail, user_password, user_name, user_firstname, user_phone_number, user_type_id) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                user.userId,
                user.mail,
                passwordHashed,
                user.name,
                user.firstname,
                user.phoneNumber,
                user.typeId
            ]);
            const headers = res[0] as ResultSetHeader;
            return new UserModel({
                userId: user.userId,
                mail: user.mail,
                password: passwordHashed,
                name: user.name,
                firstname: user.firstname,
                phoneNumber: user.phoneNumber,
                typeId: user.typeId
            });
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    //TODO convertir en SQL natif
    /*public async log(login: string, password: string): Promise<SessionInstance | null> {
        const user = await this.user.findOne({
            where: {
                login
            }
        });
        if (user === null) {
            return null;
        }
        const isSamePassword = await compare(password, user.password);
        if (!isSamePassword) {
            return null;
        }
        //génération de token depuis la date actuelle et le login
        const token = await hash(Date.now() + login, 5);
        const session = await this.session.create({
            token
        });
        await session.setUser(user);
        return session;
    }

    public async getSession(token: string): Promise<SessionInstance | null> {
        return this.session.findOne({
            where: {
                token
            }
        });
    }*/
}