import express from "express";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isAdminConnected} from "../Utils";
import {MediaController} from "../controllers";
import {LogError} from "../models";


const mediaRouter = express.Router();

/**
 * récupération de tous les medias
 * URL : /zoo/media?[limit={x}&offset={x}]
 * Requete : GET
 * ACCES : Seulement ADMIN
 * Nécessite d'être connecté : OUI
 */
mediaRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const mediaController = new MediaController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const mediaTypeList = await mediaController.getAllMedia({
            limit,
            offset
        });

        if (mediaTypeList instanceof LogError) {
            LogError.HandleStatus(res, mediaTypeList);
            return;
        }
        res.json(mediaTypeList);
    }
    res.status(403).end();
});

/**
 * récupération d'un media selon son id
 * URL : /zoo/media/:id
 * Requete : GET
 * ACCES : Seulement ADMIN
 * Nécessite d'être connecté : OUI
 */
mediaRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const mediaController = new MediaController(connection);
        const mediaType = await mediaController.getMediaById(Number.parseInt(req.params.id));
        if (mediaType === null) {
            res.status(404).end();
        } else {
            res.json(mediaType);
        }
    }
    res.status(403).end();
});
/**
 * récupération du media selon son path
 * URL : /zoo/media/:path
 * Requete : GET
 * ACCES : Seulement ADMIN
 * Nécessite d'être connecté : OUI
 */
mediaRouter.get("/path/:path", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const mediaController = new MediaController(connection);
        const mediaType = await mediaController.getMediaByPath(req.params.path);
        if (mediaType instanceof LogError) {
            LogError.HandleStatus(res, mediaType);
            return;
        } else {
            res.json(mediaType);
        }
    }
    res.status(403).end();
});


/**
 * modification d'un media selon son id
 * URL : /zoo/media/:id
 * Requete : PUT
 * ACCES : Seulement ADMIN
 * Nécessite d'être connecté : OUI
 */
mediaRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {

        const mediaId = Number.parseInt(req.params.id);
        const mediaPath = req.body.path;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (mediaId === undefined) {
            res.status(400).end("Renseigner l'id");
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const mediaController = new MediaController(connection);
        //modification
        const mediaType = await mediaController.updateMedia({
            media_id: mediaId,
            media_path: mediaPath,
        });
        if (mediaType instanceof LogError) {
            LogError.HandleStatus(res, mediaType);
            return;
        } else {
            res.json(mediaType);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'un media selon son id
 * URL : /zoo/media/:id
 * Requete : DELETE
 * ACCES : Seulement ADMIN
 * Nécessite d'être connecté : OUI
 */
mediaRouter.delete("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const mediaController = new MediaController(connection);
        //suppression
        const success = await mediaController.removeMediaById(Number.parseInt(req.params.id));
        if (success instanceof LogError) {
            LogError.HandleStatus(res, success);
            return;
        } else {
            res.json(success);
        }
    }
    res.status(403).end();
});

/**
 * ajout d'un media
 * URL : /zoo/media/add
 * Requete : POST
 * ACCES : Seulement ADMIN
 * Nécessite d'être connecté : OUI
 */
mediaRouter.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const mediaController = new MediaController(connection);

        const mediaId = await mediaController.getMaxMediaId() + 1;
        const mediaPath = req.body.path;

        //toutes les informations sont obligatoires
        if (mediaId === undefined || mediaPath === undefined ) {
            res.status(400).end("Remplir l'id ainsi que le path");
            return;

        }

        const mediaType = await mediaController.createMedia({
            media_id: mediaId,
            media_path: mediaPath,

        })
        if (mediaType instanceof LogError) {
            LogError.HandleStatus(res, mediaType);
            return;
        } else {
            res.json(mediaType);
        }
    }
    res.status(403).end();
});


export {mediaRouter};
