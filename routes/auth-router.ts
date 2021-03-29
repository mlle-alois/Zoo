import express from "express";
import {DatabaseUtils} from "../database/database";
import {authMiddleWare} from "../middlewares/auth-middleware";
import {AuthController} from "../controllers";
import {UserController} from "../controllers";

const authRouter = express.Router();

authRouter.post("/subscribe", async function (req, res) {
    const connexion = await DatabaseUtils.getConnexion();
    const userController = new UserController(connexion);
    const userId = await userController.getMaxId();
    const mail = req.body.mail;
    const password = req.body.password;
    const name = req.body.name;
    const firstname = req.body.firstname;
    const phoneNumber = req.body.phoneNumber;
    const typeId = req.body.typeId;
    if (mail === undefined || password === undefined
        || name === undefined || firstname === undefined
        || phoneNumber === undefined || typeId === undefined) {
        res.status(400).end();
        return;
    }
    const authController = new AuthController(connexion);
    const user = await authController.subscribe({
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

//TODO adapter à la BDD actuelle
/*authRouter.post("/login", async function (req, res) {
    const login = req.body.login;
    const password = req.body.password;
    if (login === undefined || password === undefined) {
        res.status(400).end();
        return;
    }
    const authController = await AuthController.getInstance();
    const user = await authController.log(login, password);
    if(user === null) {
        res.status(404).end();
        return;
    } else {
        res.json(user);
    }
});

//2e param -> authMiddleWare : vérifier que l'utilisateur est connecté pour le déconnecter
//passe à la suite seulement si authMiddleWare passe à next
authRouter.delete("/logout", authMiddleWare, function (req, res) {
    //TODO supprimer la session
    res.send("sup la session");
});*/

//ne nécessite pas de renommer contrairement au default
export {
    authRouter
}