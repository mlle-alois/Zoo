import express from "express";
import {PassController} from "../controllers/pass-controller";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {getAuthorizedToken, isAdminConnected} from "../acces/give-access";
import {INTEGER} from "sequelize";
import {SpaceController} from "../controllers/space-controller";
import {SessionController, UserController} from "../controllers";

const passRouter = express.Router();

/**
 * récupération de tous les billets
 * URL : /zoo/pass?limit={x}&offset={x}
 * Requete : GET
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.get("/get-all", authUserMiddleWare, async function (req, res) {
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

/**
 * donner à un billet l'accès à un espace
 * URL : /zoo/pass/give-access?passId={x}&spaceId={x}[&order={x}]
 * Requete : POST
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.post("/give-access", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passController = new PassController(connection);
        const spaceController = new SpaceController(connection);

        const passId = Number.parseInt(req.query.passId as string);
        const spaceId = Number.parseInt(req.query.spaceId as string);
        let numOrderAccess: number | undefined = Number.parseInt(req.query.order as string);
        //informations obligatoires
        if (passId === undefined || spaceId === undefined) {
            res.status(400).end();
            return;
        }
        //vérification que l'espace existe
        if (!await spaceController.doesSpaceExist(spaceId)) {
            res.send('L\'espace renseigné n\'existe pas');
            res.status(409).end();
            return;
        }
        //vérification que le billet existe
        if (!await passController.doesPassExist(passId)) {
            res.send('Le billet renseigné n\'existe pas');
            res.status(409).end();
            return;
        }
        //numéro d'ordre obligatoire si le billet est un escape game
        const isEscapeGame = await passController.isEscapeGamePass(passId);
        if (isEscapeGame) {
            if (isNaN(numOrderAccess)) {
                res.send('Un numéro d\'ordre doit être renseigné');
                res.status(400).end();
                return;
            }
        }
        //si ce n'est pas un type escape game, on met l'ordre à undefined si jamais il est renseigné
        else {
            numOrderAccess = undefined;
        }
        //vérification si le billet a déjà accès à l'espace
        const passAccess = await passController.getAccessByPassIdAndSpaceId(passId, spaceId);
        if (passAccess !== null) {
            res.send('L\'accès à cet espace est déjà possible pour ce billet');
            res.status(409).end(); //conflit
            return;
        }
        const passType = await passController.createAccessForPassAtSpace({
            passId,
            spaceId,
            numOrderAccess
        });

        if (passType !== null) {
            res.status(201);
            res.json(passType);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

/**
 * retirer l'accès à un espace à un billet
 * URL : /zoo/pass/remove-access?passId={x}&spaceId={x}
 * Requete : DELETE
 * ACCES : ADMIN
 * Nécessite d'être connecté : OUI
 */
passRouter.delete("/remove-access", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const passController = new PassController(connection);

        const passId = Number.parseInt(req.query.passId as string);
        const spaceId = Number.parseInt(req.query.spaceId as string);
        //informations obligatoires
        if (passId === undefined || spaceId === undefined) {
            res.status(400).end();
            return;
        }
        //vérification si le billet a déjà accès à l'espace
        const passAccess = await passController.getAccessByPassIdAndSpaceId(passId, spaceId);
        if (passAccess === null) {
            res.send('Le billet n\'a pas accès à l\'espace');
            res.status(409).end(); //conflit
            return;
        }
        const success = await passController.removeAccessForPassAtSpace(passId, spaceId);

        if (success) {
            res.status(201);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

/**
 * acheter un billet pour l'utilisateur connecté
 * URL : /zoo/pass/buy?passId={x}
 * Requete : POST
 * ACCES : tout le monde
 * Nécessite d'être connecté : OUI
 */
passRouter.post("/buy", authUserMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const passController = new PassController(connection);
    const userController = new UserController(connection);
    const sessionController = new SessionController(connection);

    const token = getAuthorizedToken(req);
    const session = await sessionController.getSessionByToken(token);

    const passId = Number.parseInt(req.query.passId as string);
    let userId: number | undefined;
    if (session && session.userId != null) {
        userId = (await userController.getUserById(session.userId))?.userId;
    }
    //informations obligatoires
    if (passId === undefined || userId === undefined) {
        res.status(400).end();
        return;
    }
    //vérification que le billet existe
    const pass = await passController.getPassById(passId);
    if (pass === undefined) {
        res.send('Le billet renseigné n\'existe pas');
        res.status(409).end();
        return;
    }
    if (!pass?.isAvailable) {
        res.send('Le billet demandé n\'est pas disponible à l\'achat');
        res.status(409).end();
        return;
    }
    const purchase = await passController.buyPassForUserAtActualDate({
        passId,
        userId
    });
    if (purchase !== null) {
        res.status(201);
        res.json(purchase);
    } else {
        res.status(400).end();
    }
});

export {
    passRouter
};