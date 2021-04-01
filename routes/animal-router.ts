import express from "express";
import {AnimalController, SpeciesController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authMiddleWare} from "../middlewares/auth-middleware";

const router = express.Router();
// TODO décommenter les champs space une fois le CRUD space mit en place

/**
 * récupération de touts les animaux
 * URL : /zoo/animal?limit={x}&offset={x}
 * Requete : GET
 */
router.get("/", authMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const animalController = new AnimalController(connection);
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
    const animalList = await animalController.getAllAnimal({
        limit,
        offset
    });
    res.json(animalList);
});

/**
 * récupération d'un animal selon son id
 * URL : /zoo/animal/:id
 * Requete : GET
 */
router.get("/:id",authMiddleWare, async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const animalController = new AnimalController(connection);
    //récupération de l'espèce
    const animal = await animalController.getAnimalById(Number.parseInt(req.params.id));
    if (animal === null) {
        res.status(404).end();
    } else {
        res.json(animal);
    }
});

/**
 * modification d'un animal selon son id
 * URL : /zoo/animal/:id
 * Requete : PUT
 */
router.put("/:id",authMiddleWare, async function (req, res) {

    const id = Number.parseInt(req.params.id);
    const name = req.body.name;
    const age = Number.parseInt(req.body.age);
    // const space = req.body.space;

    //invalide s'il n'y a pas d'id ou qu'aucune option à modifier n'est renseignée
    if (id === undefined || name === undefined ) {
        res.status(400).end();
        return;
    }
    const connection = await DatabaseUtils.getConnection();
    const animalController = new AnimalController(connection);
    //modification
    const animal = await animalController.updateAnimal(
        id,
        name,
        age,
        // space
    );
    if (animal === null) {
        res.status(404);
    } else {
        res.json(animal);
    }
});

/**
 * suppression d'un animal selon son id
 * URL : /zoo/animal/:id
 * Requete : DELETE
 */
router.delete("/:id", authMiddleWare,async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const animalController = new AnimalController(connection);
    //suppression
    const success = await animalController.removeAnimalById(Number.parseInt(req.params.id));
    if (success) {
        // pas de contenu mais a fonctionné
        res.status(204).end();
    } else {
        res.status(404).end();
    }
});

router.post("/add", authMiddleWare,async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const animalController = new AnimalController(connection);
    const speciesController = new SpeciesController(connection);
    //species_id Max en base
    const id = await animalController.getMaxAnimalId() + 1;
    const name = req.body.name;
    const age = Number.parseInt(req.body.age);
    const speciesName = req.body.speciesName;
    const species = await speciesController.getSpeciesByName(speciesName);
    const speciesId = species?.id;
    // const space = Number.parseInt(req.body.space);
    //toutes les informations sont obligatoires
    if ( name === undefined ) {
        res.status(400).end();
        return;
    }
    //Ajout d'un animal
    if (speciesId !== undefined) {
        const animal = await animalController.createAnimal({
            id,
            name,
            age,
            speciesId,
            // space
        });
        if (animal !== null) {
            res.status(201);
            res.json(animal);
        } else {
            res.status(400).end();
        }
    } else {
        res.status(400).end();
    }
});

export default router;