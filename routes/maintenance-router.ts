import express from "express";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {DateUtils, isClientConnected} from "../Utils";
import {LogError} from "../models";
import {MaintenanceController} from "../controllers/maintenance-controller";

const maintenanceRouter = express.Router();

/**
 * Récupération de toutes les maintenances
 * URL : /zoo/maintenance?[limit={x}&offset={x}]
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
maintenanceRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const maintenanceController = new MaintenanceController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const maintenanceList = await maintenanceController.getAllMaintenance({
            limit,
            offset
        });
        res.json(maintenanceList);
    }
    LogError.HandleStatus(res, {
        numError: 403,
        text: "Vous n'avez pas les droits d'accès"
    });
});

/**
 * Récupération d'une maintenance selon son id, son espace ou son manager
 * URL : /zoo/maintenance/:query
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
maintenanceRouter.get("/:query",authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const maintenanceController = new MaintenanceController(connection);
        const searchParams = ["id=", "space=", "manager="];
        if (req.params.query.match(searchParams[0])) {
            //récupération de l'animal
            const maintenance = await maintenanceController.getMaintenanceById(
                Number.parseInt(req.params.query.substring(searchParams[0].length)));
            if (maintenance === null) {
                res.status(404).end();
            } else {
                res.json(maintenance);
            }
        }
        if (req.params.query.match(searchParams[1])) {
            const maintenanceList = await maintenanceController.getMaintenanceBySpace(
                req.params.query.substring(searchParams[1].length));
            if (maintenanceList === null) {
                res.status(404).end();
            } else {
                res.json(maintenanceList);
            }
        }
        if (req.params.query.match(searchParams[2])) {
            const maintenanceList = await maintenanceController.getMaintenanceByManager(
                req.params.query.substring(searchParams[2].length));
            if (maintenanceList === null) {
                res.status(404).end();
            } else {
                res.json(maintenanceList);
            }
        }
    }
    res.status(403).end();
});

/**
 * Fermeture d'une maintenance selon son id
 * URL : /zoo/maintenance/:id
 * Requete : PUT
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
maintenanceRouter.put("/:id",authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const id = Number.parseInt(req.params.id);

        //invalide s'il n'y a pas d'Id ou qu'aucune option à modifier n'est renseignée
        if (id === undefined) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const maintenanceController = new MaintenanceController(connection);
        //modification
        const maintenance = await maintenanceController.closeMaintenance(id);
        if (maintenance === null) {
            res.status(404);
        } else {
            res.json(maintenance);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'une maintenance selon son id
 * URL : /zoo/maintenance/:id
 * Requete : DELETE
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
maintenanceRouter.delete("/:id", authUserMiddleWare,async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const maintenanceController = new MaintenanceController(connection);
        //suppression
        const success = await maintenanceController.removeMaintenanceById(Number.parseInt(req.params.id));
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
 * Création d'une maintenance
 * URL : /zoo/maintenance/add
 * Requete : POST
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
maintenanceRouter.post("/add", authUserMiddleWare,async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const maintenanceController = new MaintenanceController(connection);
        //maintenance_id Max en base
        const id = await maintenanceController.getMaintenanceId() + 1;
        const dateHourStart = DateUtils.getCurrentTimeStamp();
        const dateHourEnd = DateUtils.getCurrentTimeStamp();
        const spaceId = Number.parseInt(req.body.spaceId);
        const managerId = Number.parseInt(req.body.managerId);
        //toutes les informations sont obligatoires

        if ( dateHourStart === undefined ) {
            res.status(400).end();
            return;
        }
        //Création d'une maintenance
        if (spaceId !== undefined && managerId !== undefined) {
            const maintenance = await maintenanceController.createMaintenance({
                id,
                dateHourStart,
                dateHourEnd,
                spaceId,
                managerId
            });
            if (maintenance !== null) {
                res.status(201);
                res.json(maintenance);
            } else {
                res.status(400).end();
            }
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

export {
    maintenanceRouter
}
