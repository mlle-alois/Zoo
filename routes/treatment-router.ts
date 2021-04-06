import express from "express";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isAdminConnected, isClientConnected, isVeterinaryConnected} from "../acces/give-access";
import {TreatmentController} from "../controllers";


const treatmentRouter = express.Router();

/**
 * récupération de tous les Treatments
 * URL : /zoo/treatment?limit={x}&offset={x}
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
treatmentRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentController = new TreatmentController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const treatmentTypeList = await treatmentController.getAllTreatment({
            limit,
            offset
        });
        res.json(treatmentTypeList);
    }
    res.status(403).end();
});

/**
 * récupération d'un Treatment selon son id
 * URL : /zoo/treatment/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
treatmentRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentController = new TreatmentController(connection);
        const treatmentType = await treatmentController.getTreatmentById(Number.parseInt(req.params.id));
        if (treatmentType === null) {
            res.status(404).end();
        } else {
            res.json(treatmentType);
        }
    }
    res.status(403).end();
});
/**
 * récupération de tous les traitements pour un veterinaire
 * URL : /zoo/treatment/user/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
treatmentRouter.get("/user/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentController = new TreatmentController(connection);
        const TreatmentType = await treatmentController.getTreatmentByVeterinary(Number.parseInt(req.params.id));
        if (TreatmentType === null) {
            res.status(404).end();
        } else {
            res.json(TreatmentType);
        }
    }
    res.status(403).end();
});
/**
 * récupération de tous les traitements pour un animal
 * URL : /zoo/treatment/animal/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
treatmentRouter.get("/animal/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentController = new TreatmentController(connection);
        const TreatmentType = await treatmentController.getTreatmentByAnimalId(Number.parseInt(req.params.id));
        if (TreatmentType === null) {
            res.status(404).end();
        } else {
            res.json(TreatmentType);
        }
    }
    res.status(403).end();
});

/**
 * modification d'un Treatment selon son id
 * URL : /zoo/treatment/:id
 * Requete : PUT
 * ACCES : Seulement VETERINAIRE ET ADMIN
 * Nécessite d'être connecté : OUI
 */
treatmentRouter.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isVeterinaryConnected(req) || await isAdminConnected(req)) {

        const treatmentId= Number.parseInt(req.params.id);
        const treatmentDate = req.body.date;
        const treatmentObservation = req.body.observation;
        const treatmentAnimalId = req.body.animalId;
        const treatmentTypeId = req.body.typeId;
        const treatmentVeterinary = req.body.veterinaryId;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (treatmentId === undefined ) {
            res.status(400).end("Renseigner l'id");
            return;

        }
        const connection = await DatabaseUtils.getConnection();
        const treatmentController = new TreatmentController(connection);
        //modification
        const treatmentType = await treatmentController.updateTreatment({
            treatment_id: treatmentId,
            treatment_date: treatmentDate,
            treatment_observation: treatmentObservation,
            animal_id: treatmentAnimalId,
            treatment_type_id: treatmentTypeId,
            veterinary_id: treatmentVeterinary
        });
        if (typeof treatmentType === "string") {
            res.status(401).end(treatmentType);
            return;
        }
        if (treatmentType === null) {
            res.status(404);
        } else {
            res.json(treatmentType);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'un Treatment selon son id
 * URL : /zoo/treatment/:id
 * Requete : DELETE
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
treatmentRouter.delete("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isVeterinaryConnected(req) || await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentController = new TreatmentController(connection);
        //suppression
        const success = await treatmentController.removeTreatmentById(Number.parseInt(req.params.id));
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
 * ajout d'un Treatment
 * URL : /zoo/treatment/add
 * Requete : POST
 * ACCES : Seulement VETERINAIRE ET ADMIN
 * Nécessite d'être connecté : OUI
 */
treatmentRouter.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (await isVeterinaryConnected(req) || await isAdminConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const treatmentController = new TreatmentController(connection);

        const treatmentId = await treatmentController.getMaxTreatmentId() + 1;
        const treatmentDate = req.body.date;
        const treatmentObservation = req.body.observation;
        const treatmentAnimalId = req.body.animalId;
        const treatmentTypeId = req.body.typeId;
        const treatmentVeterinary = req.body.veterinaryId;
        //toutes les informations sont obligatoires
        if (treatmentId === undefined || treatmentDate === undefined || treatmentObservation === undefined || treatmentAnimalId === undefined || treatmentTypeId === undefined || treatmentVeterinary === undefined ) {
            res.status(400).end("Remplir tous les champs suivants : date ; observation ; animalId ; typeId ; veterinary");
            return;

        }


        const TreatmentType = await treatmentController.createTreatment({
            treatment_id: treatmentId,
            treatment_date: treatmentDate,
            treatment_observation: treatmentObservation,
            animal_id: treatmentAnimalId,
            treatment_type_id: treatmentTypeId,
            veterinary_id: treatmentVeterinary
        })
        if (typeof TreatmentType === "string") {
            res.status(401).end(TreatmentType);
            return;
        }

        if (TreatmentType !== null) {

            res.status(201);
            res.json(TreatmentType);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});



export {treatmentRouter};
