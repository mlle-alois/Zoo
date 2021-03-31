import express from "express";
import {DatabaseUtils} from "../database/database";
import {SessionController} from "../controllers";
import {UserController} from "../controllers";
import {CLIENT_USER_TYPE_ID} from "../consts";

/**
 * vérification qu'un utilisateur est connecté
 * ATTENTION : Cette fonction ne vérifie pas les droits d'accès
 * @param req
 * @param res
 * @param next
 */
export async function authOtherThanClientMiddleWare(req: express.Request, res: express.Response, next: express.NextFunction) {
    const auth = req.headers['authorization'];
    if (auth !== undefined) {
        //récupération du token autorisé
        const token = auth.slice(7);
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const userController = new UserController(connection);
        const session = await sessionController.getSessionByToken(token);
        if (session !== null) {
            //contrôle des droits d'accès
            if (session.userId != null) {
                const user = await userController.getUserById(session.userId);
                if (user?.typeId !== CLIENT_USER_TYPE_ID && user?.typeId !== undefined) {
                    next();
                    return;
                }
            }
        }
        /* pas le droit d'y accéder si
           -> Aucune session associée au token
           -> Aucun utilisateur associé à la session
           -> Utilisateur de type client ou sans type
         */
        res.status(403).end();
    } else {
        //pas d'user connecté
        res.status(401).end();
    }
}