import express from "express";
import {PassController, PassTypeController, SessionController, UserController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {
    getAuthorizedToken,
    getUserIdConnected,
    isAdminConnected,
    isClientConnected,
    isConcernedUserConnected
} from "../Utils";
import {LogError} from "../models";

const passRouter = express.Router();

/**
 * récupération de tous les billets
 * URL : /zoo/pass/get-all?[limit={x}&offset={x}]
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
passRouter.get("/get-all", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
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
 * ACCES : Tous sauf CLIENT (sauf si le client est le titulaire de ce billet)
 * Nécessite d'être connecté : OUI
 */
passRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    const connection = await DatabaseUtils.getConnection();
    const passController = new PassController(connection);
    //récupération du billet
    const pass = await passController.getPassById(Number.parseInt(req.params.id));
    if (!(pass instanceof LogError)) {
        if (!await isClientConnected(req) || await isConcernedUserConnected(pass.userId, req)) {
            if (pass === null) {
                res.status(404).end();
            } else {
                res.json(pass);
            }
        }
        res.status(403).end();
    } else {
        LogError.HandleStatus(res, pass);
        return;
    }
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
        const dateHourPeremption = req.body.dateHourPeremption;
        const passTypeId = isNaN(Number.parseInt(req.body.passTypeId)) ? undefined : Number.parseInt(req.body.passTypeId);
        const userId = isNaN(Number.parseInt(req.body.userId)) ? undefined : Number.parseInt(req.body.userId);

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (passId === undefined || (dateHourPeremption === undefined &&
            passTypeId === undefined && userId === undefined)) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const passController = new PassController(connection);
        const passTypeController = new PassTypeController(connection);

        //vérifier que le billet existe
        const passById = await passController.getPassById(passId);
        if (passById instanceof LogError) {
            LogError.HandleStatus(res, passById);
            return;
        }
        //vérifier que le type de billet est disponible
        if (passTypeId !== undefined) {
            const passType = await passTypeController.getPassTypeById(passTypeId);
            if (passType instanceof LogError) {
                LogError.HandleStatus(res, passType);
                return;
            } else {
                if (!passType.passTypeIsAvailable) {
                    LogError.HandleStatus(res, new LogError({numError: 409, text: "Pass type is not available"}));
                    return;
                }
            }
        }
        //modification
        const pass = await passController.updatePass({
            passId,
            dateHourPeremption,
            passTypeId,
            userId
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
 * URL : /zoo/pass/delete/:id
 * Requete : DELETE
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.delete("/delete/:id", authUserMiddleWare, async function (req, res) {
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
 * achat d'un billet
 * URL : /zoo/pass/buy
 * Requete : POST
 * ACCES : Tout le monde
 * Nécessite d'être connecté : OUI
 */
passRouter.post("/buy", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    const connection = await DatabaseUtils.getConnection();
    const passController = new PassController(connection);

    const passId = await passController.getMaxPassId() + 1;
    const passTypeId = req.body.passTypeId;
    const userId = await getUserIdConnected(req);
    //toutes les informations sont obligatoires
    if (passId === undefined || passTypeId === undefined || userId === undefined) {
        res.status(400).end();
        return;
    }
    //vérifier que le billet est disponible à l'achat
    const passTypeController = new PassTypeController(connection);
    const passType = await passTypeController.getPassTypeById(Number.parseInt(passTypeId));

    if (passType instanceof LogError) {
        LogError.HandleStatus(res, passType);
        return;
    } else {
        if (!passType.passTypeIsAvailable) {
            LogError.HandleStatus(res, new LogError({numError: 409, text: "Pass type is not available"}));
            return;
        }
    }
    const pass = await passController.buyPass({
        passId,
        passTypeId,
        userId
    })

    if (pass !== null) {
        res.status(201);
        res.json(pass);
    } else {
        res.status(400).end();
    }
});

/**
 * Visite d'un espace
 * URL : /zoo/pass/visit?passId=X&spaceId=X
 * Requete : POST
 * ACCES : Tout le monde
 * Nécessite d'être connecté : OUI
 */
passRouter.post("/visit", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    const connection = await DatabaseUtils.getConnection();
    const passController = new PassController(connection);

    const passId = Number.parseInt(req.query.passId as string);
    const spaceId = Number.parseInt(req.query.spaceId as string);
    const userId = await getUserIdConnected(req);
    //toutes les informations sont obligatoires
    if (userId === undefined) {
        res.status(400).end();
        return;
    }

    const visit = await passController.usePassInSpaceForUser({pass_id:passId,space_id:spaceId})

    if (visit instanceof LogError) {
        LogError.HandleStatus(res, visit);
        return;
    }
    res.json(visit);
});

/**
 * utiliser un billet pour l'utilisateur connecté (validation à l'entrée du parc)
 * URL : /zoo/pass/use?passId={x}
 * Requete : POST
 * ACCES : tout le monde
 * Nécessite d'être connecté : OUI
 */
passRouter.post("/use", authUserMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const passController = new PassController(connection);

    const passId = Number.parseInt(req.query.passId as string);
    //informations obligatoires
    if (passId === undefined) {
        res.status(400).end();
        return;
    }
    const userId = await getUserIdConnected(req);
    const use = await passController.usePassForUserAtActualDate(passId, userId);
    if (use instanceof LogError) {
        LogError.HandleStatus(res, use);
    } else {
        res.status(201);
        res.json(use);
    }
});

export {
    passRouter
};