import express from "express";
import {PassTypeController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {getAuthorizedToken, isAdminConnected} from "../Utils";
import {SpaceController} from "../controllers";
import {SessionController, UserController} from "../controllers";
import {LogError} from "../models";

const passTypeRouter = express.Router();

/**
 * récupération de tous les types de type de billets
 * URL : /zoo/pass-type/get-all?[limit={x}&offset={x}]
 * Requete : GET
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passTypeRouter.get("/get-all", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passTypeController = new PassTypeController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const passTypeTypeList = await passTypeController.getAllPassType({
            limit,
            offset
        });
        res.json(passTypeTypeList);
    }
    res.status(403).end();
});

/**
 * récupération d'un type de billet selon son id
 * URL : /zoo/pass-type/:id
 * Requete : GET
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passTypeRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passTypeController = new PassTypeController(connection);
        const passType = await passTypeController.getPassTypeById(Number.parseInt(req.params.id));
        if (passType instanceof LogError) {
            LogError.HandleStatus(res, passType);
        } else {
            res.json(passType);
        }
    }
    res.status(403).end();
});

/**
 * modification d'un type de billet selon son id
 * URL : /zoo/pass-type/:id
 * Requete : PUT
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passTypeRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const passTypeId = Number.parseInt(req.params.id);
        const passTypeName = req.body.passTypeName;
        const passTypePrice = req.body.price;
        const passTypeIsAvailable = req.body.isAvailable;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (passTypeId === undefined || (passTypeName === undefined && passTypePrice === undefined && passTypeIsAvailable === undefined)) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const passTypeController = new PassTypeController(connection);
        //modification
        const passType = await passTypeController.updatePassType({
            passTypeId,
            passTypeName,
            passTypePrice,
            passTypeIsAvailable
        });
        if (passType instanceof LogError) {
            LogError.HandleStatus(res, passType);
        } else {
            res.json(passType);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'un type de billet selon son id
 * URL : /zoo/pass-type/delete/:id
 * Requete : DELETE
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passTypeRouter.delete("/delete/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passTypeController = new PassTypeController(connection);
        //suppression
        const success = await passTypeController.removePassTypeById(Number.parseInt(req.params.id));
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
 * ajout d'un type de billet
 * URL : /zoo/pass-type/add
 * Requete : POST
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passTypeRouter.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passTypeController = new PassTypeController(connection);

        const passTypeId = await passTypeController.getMaxPassTypeId() + 1;
        const passTypeName = req.body.passTypeName;
        const passTypePrice = req.body.price;
        const passTypeIsAvailable = req.body.isAvailable;
        //toutes les informations sont obligatoires
        if (passTypeId === undefined || (passTypeName === undefined && passTypePrice === undefined && passTypeIsAvailable === undefined)) {
            res.status(400).end();
            return;
        }
        const passType = await passTypeController.createPassType({
            passTypeId,
            passTypeName,
            passTypePrice,
            passTypeIsAvailable
        })

        if (passType instanceof LogError) {
            LogError.HandleStatus(res, passType);
        } else {
            res.status(201);
            res.json(passType);
        }
    }
    res.status(403).end();
});

//TODO faire get all access, get access for pass id, get access for space id

/**
 * donner à un type de billet l'accès à un espace
 * URL : /zoo/pass-type/give-access?passTypeId={x}&spaceId={x}[&order={x}]
 * Requete : POST
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passTypeRouter.post("/give-access", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passTypeController = new PassTypeController(connection);

        const passTypeId = Number.parseInt(req.query.passTypeId as string);
        const spaceId = Number.parseInt(req.query.spaceId as string);
        let numOrderAccess: number | undefined = Number.parseInt(req.query.order as string);
        //informations obligatoires
        if (passTypeId === undefined || isNaN(passTypeId) || spaceId === undefined || isNaN(spaceId)) {
            res.status(400).end();
            return;
        }
        const passType = await passTypeController.createAccessForPassTypeAtSpace({
            passTypeId,
            spaceId,
            numOrderAccess
        });

        if (passType instanceof LogError) {
            LogError.HandleStatus(res, passType);
        } else {
            res.status(201);
            res.json(passType);
        }
    }
    res.status(403).end();
});

/**
 * retirer l'accès à un espace à un type de billet
 * URL : /zoo/pass-type/remove-access?passTypeId={x}&spaceId={x}
 * Requete : DELETE
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passTypeRouter.delete("/remove-access", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passTypeController = new PassTypeController(connection);

        const passTypeId = Number.parseInt(req.query.passTypeId as string);
        const spaceId = Number.parseInt(req.query.spaceId as string);
        //informations obligatoires
        if (passTypeId === undefined || isNaN(passTypeId) || spaceId === undefined || isNaN(spaceId)) {
            res.status(400).end();
            return;
        }
        //vérification si le type de billet a déjà accès à l'espace
        const passTypeAccess = await passTypeController.getAccessByPassTypeIdAndSpaceId(passTypeId, spaceId);
        if (passTypeAccess instanceof LogError) {
            LogError.HandleStatus(res, passTypeAccess);
            return;
        }
        const success = await passTypeController.removeAccessForPassTypeAtSpace(passTypeId, spaceId);

        if (success) {
            res.status(201).end();
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

export {
    passTypeRouter
};