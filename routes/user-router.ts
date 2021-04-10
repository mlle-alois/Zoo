import express from "express";
import {UserController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected, isConcernedUserConnected, isAdminConnected} from "../Utils";

const userRouter = express.Router();

/**
 * récupération de tous les utilisateurs
 * URL : zoo/user?[limit={x}&offset={x}]
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
userRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const userList = await userController.getAllUsers({
            limit,
            offset
        });
        res.json(userList);
    }
    res.status(403).end();
});

/**
 * récupération d'un utilisateur selon son id
 * URL : zoo/user/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
userRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        //récupération de l'utilisateur
        const user = await userController.getUserById(Number.parseInt(req.params.id));
        if (user === null) {
            res.status(404).end();
        } else {
            res.json(user);
        }
    }
    res.status(403).end();
});

/**
 * modification d'un utilisateur selon son id
 * URL : zoo/user/:id
 * Requete : PUT
 * ACCES : ADMIN ou utilisateur concerné
 * Nécessite d'être connecté : OUI
 */
userRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    const userId = Number.parseInt(req.params.id);
    const mail = req.body.mail;
    const password = req.body.password;
    const name = req.body.name;
    const firstname = req.body.firstname;
    const phoneNumber = req.body.phoneNumber;
    const typeId = req.body.typeId;
    //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
    if (userId === undefined || (mail === undefined && password === undefined &&
        name === undefined && firstname === undefined
        && phoneNumber === undefined && typeId === undefined)) {
        res.status(400).end();
        return;
    }
    //vérification droits d'accès
    if (await isConcernedUserConnected(userId, req) || await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        //modification
        const user = await userController.updateUser({
            userId,
            mail,
            password,
            name,
            firstname,
            phoneNumber,
            typeId
        });
        if (user === null) {
            res.status(404).end();
        } else {
            res.json(user);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'un utilisateur selon son id
 * URL : zoo/user/:id
 * Requete : DELETE
 * ACCES : ADMIN ou utilisateur concerné
 * Nécessite d'être connecté : OUI
 */
userRouter.delete("/:id", authUserMiddleWare, async function (req, res) {
    const userId = Number.parseInt(req.params.id);
    if (userId === undefined) {
        res.status(400).end();
        return;
    }
    //vérification droits d'accès
    if (await isConcernedUserConnected(userId, req) || await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        //suppression
        const success = await userController.deleteUserById(Number.parseInt(req.params.id));
        if (success) {
            // pas de contenu mais a fonctionné
            res.status(204).end();
        } else {
            res.status(404).end();
        }
        res.status(403).end();
    }
});

export {
    userRouter
};