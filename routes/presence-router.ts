import express from "express";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected} from "../Utils";
import {PresenceController} from "../controllers";


const presenceRouter = express.Router();

/**
 * récupération de tous les presences
 * URL : /zoo/Presence?[limit={x}&offset={x}]
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
presenceRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const PresenceTypeList = await presenceController.getAllPresence({
            limit,
            offset
        });
        res.json(PresenceTypeList);
    }
    res.status(403).end();
});

/**
 * récupération d'un presence selon son id
 * URL : /zoo/presence/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
presenceRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);
        const PresenceType = await presenceController.getPresenceById(Number.parseInt(req.params.id));
        if (PresenceType === null) {
            res.status(404).end();
        } else {
            res.json(PresenceType);
        }
    }
    res.status(403).end();
});
/**
 * récupération d'un presence selon son id
 * URL : /zoo/presence/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
presenceRouter.get("/user/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);
        const PresenceType = await presenceController.getPresenceByUser(Number.parseInt(req.params.id));
        if (PresenceType === null) {
            res.status(404).end();
        } else {
            res.json(PresenceType);
        }
    }
    res.status(403).end();
});

/**
 * modification d'une presence selon son id
 * URL : /zoo/Presence/:id
 * Requete : PUT
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
presenceRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const presenceId = Number.parseInt(req.params.id);
        const presenceStart = req.body.dateStart;
        const presenceEnd = req.body.dateEnd;
        const presenceUser = req.body.user_id;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (presenceId === undefined || (presenceUser === undefined || presenceStart === undefined || presenceEnd === undefined)) {
            res.status(400).end("Remplir tous les champs suivants : dateStart ; dateEnd ; user_id");
            return;

        }
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);
        //modification
        const PresenceType = await presenceController.updatePresence({
            presenceId: presenceId,
            dateHourStart: presenceStart,
            dateHourEnd: presenceEnd,
            userId: presenceUser
        });
        if (PresenceType === null) {
            res.status(404);
        } else {
            res.json(PresenceType);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'un presence selon son id
 * URL : /zoo/Presence/:id
 * Requete : DELETE
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
presenceRouter.delete("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);
        //suppression
        const success = await presenceController.removePresenceById(Number.parseInt(req.params.id));
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
 * ajout d'un presence
 * URL : /zoo/presence/add
 * Requete : POST
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
presenceRouter.post("/add", authUserMiddleWare, async function (req, res ) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);

        const presenceId = await presenceController.getMaxPresenceId() + 1;
        const presenceStart = req.body.dateStart;
        const presenceEnd = req.body.dateEnd;
        const presenceUser = req.body.user_id;

        //toutes les informations sont obligatoires
        if (presenceId === undefined || (presenceUser === undefined || presenceStart === undefined || presenceEnd === undefined)) {
            res.status(400).end("Remplir tous les champs suivants : dateStart ; dateEnd ; user_id");
            return;

        }
        const PresenceType = await presenceController.createPresence({
            presenceId: presenceId,
            dateHourStart: presenceStart,
            dateHourEnd: presenceEnd,
            userId: presenceUser
        })
        if (typeof PresenceType === "string") {
            res.status(401).end(PresenceType);
            return;
        }

        if (PresenceType !== null) {

            res.status(201);
            res.json(PresenceType);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

/**
 * Vérifie si le Zoo pourrait être ouvert selon les dates reçus
 * URL : /zoo/presence/open
 * Requete : POST
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
presenceRouter.post("/open", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);

        const presenceStart = req.body.dateStart; // ex "2021-04-03 18:34:48"
        const presenceEnd = req.body.dateEnd; // ex : "2021-04-03 21:35:48"

        //toutes les informations sont obligatoires
        if (presenceStart === undefined || presenceEnd === undefined) {
            res.status(400).end("Remplir tous les champs suivants : dateStart ; dateEnd ");
            return;

        }
        try {
            const isZooOpen = await presenceController.isZooCouldBeOpen({
                dateStart: presenceStart,
                dateEnd: presenceEnd,
            })
            if (isZooOpen) {
                res.status(201);
                res.json("It could be open in this period of time");
            } else {
                res.status(203).end("No it can't");
            }

            res.status(403).end();
        } catch (err) {
            console.error(err);
            res.status(403).end();
        }
    }
});


export {presenceRouter};