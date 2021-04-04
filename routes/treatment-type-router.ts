import express from "express";
import {TreatmentTypeController} from "../controllers/treatment-type-controller";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected} from "../acces/give-access";

const treatmentTypeRouter = express.Router();

/**
 * récupération de tous les types d'espaces
 * URL : /zoo/space-type?limit={x}&offset={x}
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
treatmentTypeRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentTypeController = new TreatmentTypeController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const treatmentTypeList = await treatmentTypeController.getAllTreatmentType({
            limit,
            offset
        });
        res.json(treatmentTypeList);
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
treatmentTypeRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentTypeController = new TreatmentTypeController(connection);
        const treatmentType = await treatmentTypeController.getTreatmentTypeById(Number.parseInt(req.params.id));
        if (treatmentType === null) {
            res.status(404).end();
        } else {
            res.json(treatmentType);
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
treatmentTypeRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const treatmentTypeId = Number.parseInt(req.params.id);
        const libelle = req.body.libelle;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (treatmentTypeId === undefined || libelle === undefined) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const treatmentTypeController = new TreatmentTypeController(connection);
        //modification
        const treatmentType = await treatmentTypeController.updateTreatmentType({
            treatment_type_id: treatmentTypeId,
            treatment_type_libelle: libelle,
        });
        if (treatmentType === null) {
            res.status(404);
        } else {
            res.json(treatmentType);
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
treatmentTypeRouter.delete("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentTypeController = new TreatmentTypeController(connection);
        //suppression
        const success = await treatmentTypeController.removeTreatmentTypeById(Number.parseInt(req.params.id));
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
treatmentTypeRouter.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentTypeController = new TreatmentTypeController(connection);
        const treatmentTypeId = await treatmentTypeController.getMaxtreatment_type_id() + 1;
        const libelle = req.body.libelle;
        //toutes les informations sont obligatoires
        if (libelle === undefined) {
            res.status(400).end();
            return;
        }
        //Ajout d'un type d'espace
        const treatmentType = await treatmentTypeController.createTreatmentType({
            treatment_type_id: treatmentTypeId,
            treatment_type_libelle: libelle
        })

        if (treatmentType !== null) {
            res.status(201);
            res.json(treatmentType);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

export {
    treatmentTypeRouter
};