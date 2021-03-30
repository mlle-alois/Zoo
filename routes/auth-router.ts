import express from "express";
import {DatabaseUtils} from "../database/database";
import {authMiddleWare} from "../middlewares/auth-middleware";
import {AuthController} from "../controllers";
import {UserController} from "../controllers";
import {SessionController} from "../controllers/session-controller";

const authRouter = express.Router();

/**
 * inscription d'un utilisateur
 * URL : auth/subscribe
 * Requete : POST
 */
authRouter.post("/subscribe", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const userController = new UserController(connection);
    //idUserMax en base
    const userId = await userController.getMaxUserId();
    const mail = req.body.mail;
    const password = req.body.password;
    const name = req.body.name;
    const firstname = req.body.firstname;
    const phoneNumber = req.body.phoneNumber;
    const typeId = req.body.typeId;
    //toutes les informations sont obligatoires
    if (mail === undefined || password === undefined
        || name === undefined || firstname === undefined
        || phoneNumber === undefined || typeId === undefined) {
        res.status(400).end();
        return;
    }
    const authController = new AuthController(connection);
    //inscription
    const user = await authController.subscribe({
        //incrémentation manuelle
        userId : userId + 1,
        mail,
        password,
        name,
        firstname,
        phoneNumber,
        typeId
    });
    if (user !== null) {
        res.status(201);
        res.json(user);
    } else {
        res.status(400).end();
    }
});

/**
 * connexion d'un utilisateur
 * URL : auth/login
 * Requete : POST
 */
authRouter.post("/login", async function (req, res) {
    const mail = req.body.mail;
    const password = req.body.password;
    if (mail === undefined || password === undefined) {
        res.status(400).end();
        return;
    }
    const connection = await DatabaseUtils.getConnection();
    const authController = new AuthController(connection);
    //connexion
    const session = await authController.login(mail, password);
    if(session === null) {
        res.status(404).end();
        return;
    } else {
        res.json(session);
    }
});

/**
 * déconnexion d'un utilisateur
 * URL : auth/logout
 * Requete : DELETE
 */
//2e param -> authMiddleWare : vérifier que l'utilisateur est connecté pour le déconnecter
authRouter.delete("/logout", authMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const sessionController = new SessionController(connection);
    const token = req.query.token ? req.query.token as string : "";
    if(token === "") {
        res.status(400).end;
    }
    //suppression
    const success = await sessionController.removeSessionByToken(token);
    if (success) {
        // pas de contenu mais a fonctionné
        res.status(204).end();
    } else {
        res.status(404).end();
    }
});

export {
    authRouter
}