import {DatabaseUtils} from "../database/database";
import {SessionController, UserController} from "../controllers";
import express from "express";
import {ADMIN_USER_TYPE_ID, CLIENT_USER_TYPE_ID, VETERINARY_ID} from "../consts";

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

/**
 * Le token renseigné correspond à l'utilisateur concerné par la modification ou à un ADMIN
 * @param userId
 * @param req
 */
export async function isConcernedUserConcerned(userId: number | undefined, req: express.Request): Promise<boolean> {
    const token = getAuthorizedToken(req);
    if (token !== "") {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const session = await sessionController.getSessionByToken(token);
        if (session !== null) {
            if (session.userId != null) {
                if (session.userId === userId) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * récupération de l'id de l'utilisateur connecté
 * @param req
 */
export async function getUserIdConnected(req: express.Request): Promise<number | undefined> {
    const token = getAuthorizedToken(req);
    if (token !== "") {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const userController = new UserController(connection);
        const session = await sessionController.getSessionByToken(token);
        if (session !== null) {
            return session.userId;
        }
    }
    return undefined;
}

/**
 * Le token renseigné correspond à un CLIENT
 * @param req
 */
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

/**
 * Le token renseigné correspond à un ADMIN
 * @param req
 */
export async function isAdminConnected(req: express.Request): Promise<boolean> {
    const token = getAuthorizedToken(req);
    if (token !== "") {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const userController = new UserController(connection);
        const session = await sessionController.getSessionByToken(token);
        if (session !== null) {
            if (session.userId != null) {
                const user = await userController.getUserById(session.userId);
                if (user?.typeId === ADMIN_USER_TYPE_ID) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Le token renseigné correspond à un VETERINAIRE
 * @param req
 */
export async function isVeterinaryConnected(req: express.Request): Promise<boolean> {
    const token = getAuthorizedToken(req);
    if (token !== "") {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const userController = new UserController(connection);
        const session = await sessionController.getSessionByToken(token);
        if (session !== null) {
            if (session.userId != null) {
                const user = await userController.getUserById(session.userId);
                if (user?.typeId === VETERINARY_ID) {
                    return true;
                }
            }
        }
    }
    return false;
}
