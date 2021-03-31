import express from "express";
import {DatabaseUtils} from "../database/database";
import {SessionController} from "../controllers";
import {getAuthorizedToken} from "../acces/give-access";

/**
 * vérification qu'un utilisateur est connecté
 * ATTENTION : Cette fonction ne vérifie pas les droits d'accès
 * @param req
 * @param res
 * @param next
 */
export async function authUserMiddleWare(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = getAuthorizedToken(req);
    if(token !== "") {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const session = await sessionController.getSessionByToken(token);
        if(session !== null) {
            next();
            return;
        } else {
            //pas le droit d'y accéder -> aucune session associée à ce token
            res.status(403).end();
        }
    } else {
        //pas d'user connecté
        res.status(401).end();
    }
}