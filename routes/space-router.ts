import express from "express";
import {SpaceController} from "../controllers/space-controller";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected} from "../acces/give-access";

const spaceRouter = express.Router();

/**
 * récupération de tous les espaces
 * URL : /zoo/space?limit={x}&offset={x}
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const spaceController = new SpaceController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const spaceTypeList = await spaceController.getAllSpace({
            limit,
            offset
        });
        res.json(spaceTypeList);
    }
    res.status(403).end();
});

/**
 * récupération d'un espace selon son id
 * URL : /zoo/space/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const spaceController = new SpaceController(connection);
        const spaceType = await spaceController.getSpaceById(Number.parseInt(req.params.id));
        if (spaceType === null) {
            res.status(404).end();
        } else {
            res.json(spaceType);
        }
    }
    res.status(403).end();
});

/**
 * modification d'un espace selon son id
 * URL : /zoo/space/:id
 * Requete : PUT
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const spaceId = Number.parseInt(req.params.id);
        const spaceName = req.body.spaceName;
        const spaceDescription = req.body.spaceDescription;
        const spaceCapacity = req.body.spaceCapacity;
        const openingTime = req.body.openingTime;
        const closingTime = req.body.closingTime;
        const handicappedAccess = req.body.handicappedAccess;
        const spaceTypeId = req.body.spaceTypeId;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (spaceId === undefined || (spaceName === undefined && spaceDescription === undefined
            && spaceCapacity === undefined && openingTime === undefined
            && closingTime === undefined && handicappedAccess === undefined)) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const spaceController = new SpaceController(connection);
        //modification
        const spaceType = await spaceController.updateSpace({
            spaceId,
            spaceName,
            spaceDescription,
            spaceCapacity,
            openingTime,
            closingTime,
            handicappedAccess,
            spaceTypeId
        });
        if (spaceType === null) {
            res.status(404);
        } else {
            res.json(spaceType);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'un espace selon son id
 * URL : /zoo/space/:id
 * Requete : DELETE
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceRouter.delete("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const spaceController = new SpaceController(connection);
        //suppression
        const success = await spaceController.removeSpaceById(Number.parseInt(req.params.id));
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
 * ajout d'un espace
 * URL : /zoo/space/add
 * Requete : POST
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceRouter.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const spaceController = new SpaceController(connection);

        const spaceId = await spaceController.getMaxSpaceId() + 1;
        const spaceName = req.body.spaceName;
        const spaceDescription = req.body.spaceDescription;
        const spaceCapacity = req.body.spaceCapacity;
        const openingTime = req.body.openingTime;
        const closingTime = req.body.closingTime;
        const handicappedAccess = req.body.handicappedAccess;
        const spaceTypeId = req.body.spaceTypeId;
        //toutes les informations sont obligatoires
        if (spaceName === undefined && spaceDescription === undefined
            && spaceCapacity === undefined && openingTime === undefined
            && closingTime === undefined && handicappedAccess === undefined) {
            res.status(400).end();
            return;
        }
        const space = await spaceController.createSpace({
            spaceId,
            spaceName,
            spaceDescription,
            spaceCapacity,
            openingTime,
            closingTime,
            handicappedAccess,
            spaceTypeId
        })

        if (space !== null) {
            res.status(201);
            res.json(space);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

export {
    spaceRouter
};