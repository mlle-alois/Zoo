import express from "express";
import {DatabaseUtils} from "../database/database";
import {SessionController} from "../controllers";
import {getAuthorizedToken} from "../Utils";
import {LogError} from "../models";

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
            LogError.HandleStatus(res, {
                numError: 403,
                text: "Aucune session associée à ce token"
            });
        }
    } else {
        LogError.HandleStatus(res, {
            numError: 401,
            text: "Authentification nécessaire à l'accès"
        });
    }
}