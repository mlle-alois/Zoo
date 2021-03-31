import express from "express";
import {SpeciesController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authRouter} from "./auth-router";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected} from "../acces/give-access";

const router = express.Router();

/**
 * récupération de toutes les espèces
 * URL : /zoo/species?limit={x}&offset={x}
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
router.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const speciesController = new SpeciesController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const speciesList = await speciesController.getAllSpecies({
            limit,
            offset
        });
        res.json(speciesList);
    }
    res.status(403).end();
});

/**
 * récupération d'une espèce selon son id
 * URL : /zoo/species/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
router.get("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const speciesController = new SpeciesController(connection);
        //récupération de l'espèce
        const species = await speciesController.getSpeciesById(Number.parseInt(req.params.id));
        if (species === null) {
            res.status(404).end();
        } else {
            res.json(species);
        }
    }
    res.status(403).end();
});

/**
 * modification d'une espèce selon son id
 * URL : /zoo/species/:id
 * Requete : PUT
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
router.put("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const id = Number.parseInt(req.params.id);
        const name = req.body.name;

        //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
        if (id === undefined || name === undefined) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const speciesController = new SpeciesController(connection);
        //modification
        const species = await speciesController.updateSpecies({
            id,
            name,
        });
        if (species === null) {
            res.status(404);
        } else {
            res.json(species);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'une espèce selon son id
 * URL : /zoo/species/:id
 * Requete : DELETE
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
router.delete("/:id", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const speciesController = new SpeciesController(connection);
        //suppression
        const success = await speciesController.removeSpeciesById(Number.parseInt(req.params.id));
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
 * ajout d'une espèce
 * URL : /zoo/species/add
 * Requete : POST
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
router.post("/add", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const speciesController = new SpeciesController(connection);
        //species_id Max en base
        const id = await speciesController.getMaxSpeciesId() + 1;
        const name = req.body.name;
        //toutes les informations sont obligatoires
        if (name === undefined) {
            res.status(400).end();
            return;
        }
        //Ajout d'une espèce
        const species = await speciesController.createSpecies({
            id,
            name
        })

        if (species !== null) {
            res.status(201);
            res.json(species);
        } else {
            res.status(400).end();
        }
    }
    res.status(403).end();
});

export default router;