import {UserModel} from "../models/user-model";
import {Connection} from "mysql2/promise";
import {hash} from "bcrypt";
import {SessionModel} from "../models/session-model";
import {UserController} from "./user-controller";
import {SessionController} from "./session-controller";

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
    private userController: UserController;
    private sessionController: SessionController;

    constructor(connection: Connection) {
        this.connection = connection;
        this.userController = new UserController(this.connection);
        this.sessionController = new SessionController(this.connection);
    }

    /**
     * Inscription de l'utilisateur
     * @param user -> Informations de l'utilisateur entrées en base (mot de passe haché par le code)
     */
    async subscribe(user: IUserCreationProps): Promise<UserModel | null> {
        //hachage du mot de passe
        const passwordHashed = await hash(user.password, 5);
        try {
            //inscription de l'utilisateur
            await this.connection.execute(`INSERT INTO USER (user_id, user_mail, user_password, user_name, user_firstname, user_phone_number, user_type_id) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                user.userId,
                user.mail,
                passwordHashed,
                user.name,
                user.firstname,
                user.phoneNumber,
                user.typeId
            ]);
            //récupération de l'utilisateur inscrit ou null si cela n'a pas fonctionné
            return await this.userController.getUserById(user.userId);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * login de l'utilisateur via :
     * @param mail
     * @param password
     * Récupération de la session créée
     */
    public async login(mail: string, password: string): Promise<SessionModel | null> {
        //récupération d'un utilisateur correspondant au mail et au mot de passe renseigné
        const user = await this.userController.getUserByMailAndPassword(mail, password);
        if (user === null) {
            return null;
        }
        //génération de token depuis la date actuelle et le login
        const token = await hash(Date.now() + mail, 5);
        try {
            //création de la session
            await this.connection.execute(`INSERT INTO SESSION (session_id, token, createdAt, updatedAt, deletedAt, user_id) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, ?)`, [
                await this.sessionController.getMaxSessionId(),
                token,
                user.userId
            ]);
            //récupération de la session ouverte ou null si la connexion a échoué
            return await this.sessionController.getSessionByToken(token);
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}