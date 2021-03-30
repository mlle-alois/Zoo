import express from "express";
import {SpeciesController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authRouter} from "./auth-router";
import {authMiddleWare} from "../middlewares/auth-middleware";

const router = express.Router();

/**
 * récupération de toutes les espèces
 * URL : /zoo/species?limit={x}&offset={x}
 * Requete : GET
 */
router.get("/", authMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const speciesController = new SpeciesController(connection);
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
    const speciesList = await speciesController.getAllSpecies({
        limit,
        offset
    });
    res.json(speciesList);
});

/**
 * récupération d'une espèce selon son id
 * URL : /zoo/species/:id
 * Requete : GET
 */
router.get("/:id",authMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const speciesController = new SpeciesController(connection);
    //récupération de l'espèce
    const species = await speciesController.getSpeciesById(Number.parseInt(req.params.id));
    if (species === null) {
        res.status(404).end();
    } else {
        res.json(species);
    }
});

/**
 * modification d'une espèce selon son id
 * URL : /zoo/species/:id
 * Requete : PUT
 */
router.put("/:id",authMiddleWare, async function (req, res) {

    const id = Number.parseInt(req.params.id);
    const name = req.body.name;

    //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
    if (id === undefined || name === undefined ) {
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
});

/**
 * suppression d'une espèce selon son id
 * URL : /zoo/species/:id
 * Requete : DELETE
 */
router.delete("/:id", authMiddleWare,async function (req, res) {
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
});

router.post("/add", authMiddleWare,async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const speciesController = new SpeciesController(connection);
    //species_id Max en base
    const id = await speciesController.getMaxSpeciesId() + 1;
    const name = req.body.name;
    //toutes les informations sont obligatoires
    if ( name === undefined ) {
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
});

export default router;