import {DatabaseUtils} from "../database/database";
import {SessionController, UserController} from "../controllers";
import express from "express";
import {ADMIN_USER_TYPE_ID, CLIENT_USER_TYPE_ID} from "../consts";

/**
 * Récupération du token autorisé/connecté
 * @param req
 */
export function getAuthorizedToken(req: express.Request): string {
    const auth = req.headers['authorization'];
    if (auth !== undefined) {
        //récupération du token autorisé
        return auth.slice(7);
    }
    return "";
}

export async function isConcernedUserOrAdmin(userId: number, req: express.Request): Promise<boolean> {
    const token = getAuthorizedToken(req);
    if (token !== "") {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const userController = new UserController(connection);
        const session = await sessionController.getSessionByToken(token);
        if (session !== null) {
            if (session.userId != null) {
                if (session.userId === userId) {
                    return true;
                }
                const user = await userController.getUserById(session.userId);
                if (user?.typeId === ADMIN_USER_TYPE_ID) {
                    return true;
                }
            }
        }
    }
    return false;
}

export async function isClientConnected(req: express.Request): Promise<boolean> {
    const token = getAuthorizedToken(req);
    if (token !== "") {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const userController = new UserController(connection);
        const session = await sessionController.getSessionByToken(token);
        if (session !== null) {
            if (session.userId != null) {
                const user = await userController.getUserById(session.userId);
                if (user?.typeId === CLIENT_USER_TYPE_ID) {
                    return true;
                }
            }
        }
    }
    return false;
}