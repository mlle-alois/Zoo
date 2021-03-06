import express from "express";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {AuthController} from "../controllers";
import {UserController} from "../controllers";
import {SessionController} from "../controllers";

const authRouter = express.Router();

/**
 * inscription d'un utilisateur
 * URL : auth/subscribe
 * Requete : POST
 * ACCES : Tous
 * Nécessite d'être connecté : NON
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
    if (user === null){
        res.status(400).end();
        return;
    }
    //connexion de l'utilisateur
    const session = await authController.login(mail, password);
    if (session !== null) {
        res.status(201);
        res.json({user, session});
    } else {
        res.status(400).end();
    }
});

/**
 * connexion d'un utilisateur
 * URL : auth/login
 * Requete : POST
 * ACCES : Tous
 * Nécessite d'être connecté : NON
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
 * URL : auth/logout?token=$2b$05$eiTDmmFGXYluk1RBXOKAD.r1GD8jT4naaeO5dL8D9ea/Jg//dVt6a
 * Requete : DELETE
 * ACCES : Tous
 * Nécessite d'être connecté : OUI
 */
//2e param -> authMiddleWare : vérifier que l'utilisateur est connecté pour le déconnecter
authRouter.delete("/logout", authUserMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const sessionController = new SessionController(connection);
    const token = req.query.token ? req.query.token as string : "";
    if(token === "") {
        res.status(400).end;
    }
    //suppression
    const success = await sessionController.deleteSessionByToken(token);
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