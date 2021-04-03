import express from "express";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected} from "../acces/give-access";
import {PresenceController} from "../controllers";


const presenceRouter = express.Router();

/**
 * récupération de tous les presences
 * URL : /zoo/Presence?limit={x}&offset={x}
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
 * modification d'un presence selon son id
 * URL : /zoo/Presence/:id
 * Requete : PUT
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
presenceRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const PresenceId = Number.parseInt(req.params.id);
        const PresenceStart = req.body.dateStart;
        const PresenceEnd = req.body.dateEnd;
        const PresenceUser = req.body.user_id;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (PresenceId === undefined || (PresenceUser === undefined || PresenceStart === undefined || PresenceEnd === undefined) ){
            res.status(400).end("Remplir tous les champs suivants : dateStart ; dateEnd ; user_id");
            return;

        }
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);
        //modification
        const PresenceType = await presenceController.updatePresence({
            presenceId: PresenceId,
            dateHourStart: PresenceStart,
            dateHourEnd: PresenceEnd,
            userId: PresenceUser
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
presenceRouter.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);

        const PresenceId = await presenceController.getMaxPresenceId() + 1;
        const PresenceStart = req.body.dateStart;
        const PresenceEnd = req.body.dateEnd;
        const PresenceUser = req.body.user_id;

        //toutes les informations sont obligatoires
        if (PresenceId === undefined || (PresenceUser === undefined || PresenceStart === undefined || PresenceEnd === undefined) ){
            res.status(400).end("Remplir tous les champs suivants : dateStart ; dateEnd ; user_id");
            return;

        }
        const PresenceType = await presenceController.createPresence({
            presenceId: PresenceId,
            dateHourStart: PresenceStart,
            dateHourEnd: PresenceEnd,
            userId: PresenceUser
        })
        if ( typeof PresenceType === "string") {
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


presenceRouter.post("/open", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const presenceController = new PresenceController(connection);

        const PresenceStart = req.body.dateStart;
        const PresenceEnd = req.body.dateEnd;


        //toutes les informations sont obligatoires
        if (PresenceStart === undefined || PresenceEnd === undefined) {
            res.status(400).end("Remplir tous les champs suivants : dateStart ; dateEnd ; user_id");
            return;

        }
        try {
            const isZooOpen = await presenceController.isZooCouldBeOpen({
                dateStart: PresenceStart,
                dateEnd: PresenceEnd,
            })
            if (isZooOpen) {
                res.status(201);
                res.json("It could be open in this period of time");
            } else {
                res.status(203).end("No it can't");
            }

            res.status(403).end();
        }

               catch (err) {
            console.log(err);
            res.status(403).end();
        }
    }
});



export {presenceRouter};