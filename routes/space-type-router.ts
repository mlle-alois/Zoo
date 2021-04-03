import express from "express";
import {SpaceTypeController} from "../controllers/space-type-controller";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected} from "../acces/give-access";

const spaceTypeRouter = express.Router();

/**
 * récupération de tous les types d'espaces
 * URL : /zoo/space-type?limit={x}&offset={x}
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceTypeRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const spaceTypeController = new SpaceTypeController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const spaceTypeList = await spaceTypeController.getAllSpaceType({
            limit,
            offset
        });
        res.json(spaceTypeList);
    }
    res.status(403).end();
});

/**
 * récupération d'un type d'espace selon son id
 * URL : /zoo/space-type/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceTypeRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const spaceTypeController = new SpaceTypeController(connection);
        const spaceType = await spaceTypeController.getSpaceTypeById(Number.parseInt(req.params.id));
        if (spaceType === null) {
            res.status(404).end();
        } else {
            res.json(spaceType);
        }
    }
    res.status(403).end();
});

/**
 * modification d'un type d'espace selon son id
 * URL : /zoo/space-type/:id
 * Requete : PUT
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceTypeRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const spaceTypeId = Number.parseInt(req.params.id);
        const libelle = req.body.libelle;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (spaceTypeId === undefined || libelle === undefined) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const spaceTypeController = new SpaceTypeController(connection);
        //modification
        const spaceType = await spaceTypeController.updateSpaceType({
            spaceTypeId: spaceTypeId,
            libelle: libelle,
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
 * suppression d'un type d'espace selon son id
 * URL : /zoo/space-type/:id
 * Requete : DELETE
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceTypeRouter.delete("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const spaceTypeController = new SpaceTypeController(connection);
        //suppression
        const success = await spaceTypeController.removeSpaceTypeById(Number.parseInt(req.params.id));
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
 * ajout d'un type d'espace
 * URL : /zoo/space-type/add
 * Requete : POST
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
spaceTypeRouter.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const spaceTypeController = new SpaceTypeController(connection);
        const spaceTypeId = await spaceTypeController.getMaxSpaceTypeId() + 1;
        const libelle = req.body.libelle;
        //toutes les informations sont obligatoires
        if (libelle === undefined) {
            res.status(400).end();
            return;
        }
        //Ajout d'un type d'espace
        const spaceType = await spaceTypeController.createSpaceType({
            spaceTypeId,
            libelle
        })

        if (spaceType !== null) {
            res.status(201);
            res.json(spaceType);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

export {
    spaceTypeRouter
};