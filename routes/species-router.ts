import express from "express";
import {AuthController, SpeciesController, UserController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authRouter} from "./auth-router";
import {authMiddleWare} from "../middlewares/auth-middleware";

const router = express.Router();

/**
 * récupération de toutes les espèces
 * URL : zoo/user?limit={x}&offset={x}
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
 * URL : zoo/user/:id
 * Requete : GET
 */
router.get("/:id",authMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const speciesController = new SpeciesController(connection);
    //récupération de l'espèce
    const user = await speciesController.getSpeciesById(Number.parseInt(req.params.id));
    if (user === null) {
        res.status(404).end();
    } else {
        res.json(user);
    }
});

/**
 * modification d'un utilisateur selon son id
 * URL : zoo/user/:id
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
 * suppression d'un utilisateur selon son id
 * URL : zoo/user/:id
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
    //idUserMax en base
    const id = await speciesController.getMaxSpeciesId();
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