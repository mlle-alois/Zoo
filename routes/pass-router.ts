import express from "express";
import {PassController} from "../controllers/pass-controller";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isAdminConnected} from "../acces/give-access";

const passRouter = express.Router();

/**
 * récupération de tous les billets
 * URL : /zoo/pass?limit={x}&offset={x}
 * Requete : GET
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passController = new PassController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const passTypeList = await passController.getAllPass({
            limit,
            offset
        });
        res.json(passTypeList);
    }
    res.status(403).end();
});

/**
 * récupération d'un billet selon son id
 * URL : /zoo/pass/:id
 * Requete : GET
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passController = new PassController(connection);
        const passType = await passController.getPassById(Number.parseInt(req.params.id));
        if (passType === null) {
            res.status(404).end();
        } else {
            res.json(passType);
        }
    }
    res.status(403).end();
});

/**
 * modification d'un billet selon son id
 * URL : /zoo/pass/:id
 * Requete : PUT
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const passId = Number.parseInt(req.params.id);
        const passName = req.body.passName;
        const price = req.body.price;
        const isAvailable = req.body.isAvailable;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (passId === undefined || (passName === undefined && price === undefined && isAvailable === undefined)) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const passController = new PassController(connection);
        //modification
        const pass = await passController.updatePass({
            passId,
            passName,
            price,
            isAvailable
        });
        if (pass === null) {
            res.status(404);
        } else {
            res.json(pass);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'un billet selon son id
 * URL : /zoo/pass/:id
 * Requete : DELETE
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.delete("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passController = new PassController(connection);
        //suppression
        const success = await passController.removePassById(Number.parseInt(req.params.id));
        if (success) {
            // pas de contenu mais a fonctionné
            res.status(204).end();
        } else {
            res.status(404).end();
        }
    }
    res.status(403).end();
});

/**
 * ajout d'un billet
 * URL : /zoo/pass/add
 * Requete : POST
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passController = new PassController(connection);

        const passId = await passController.getMaxPassId() + 1;
        const passName = req.body.passName;
        const price = req.body.price;
        const isAvailable = req.body.isAvailable;
        //toutes les informations sont obligatoires
        if (passId === undefined || (passName === undefined && price === undefined && isAvailable === undefined)) {
            res.status(400).end();
            return;
        }
        const passType = await passController.createPass({
            passId,
            passName,
            price,
            isAvailable
        })

        if (passType !== null) {
            res.status(201);
            res.json(passType);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

export {
    passRouter
};