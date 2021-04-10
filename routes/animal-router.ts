import express from "express";
import {AnimalController, SpeciesController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected} from "../Utils";
import {LogError} from "../models";

const animalRouter = express.Router();

/**
 * récupération de touts les animaux
 * URL : /zoo/animal?[limit={x}&offset={x}]
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
animalRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const animalController = new AnimalController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const animalList = await animalController.getAllAnimal({
            limit,
            offset
        });
        res.json(animalList);
    }
    LogError.HandleStatus(res, {
        numError: 403,
        text: "Vous n'avez pas les droits d'accès"
    });
});

/**
 * récupération d'un animal selon son id
 * URL : /zoo/animal/:id
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
animalRouter.get("/:id",authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const animalController = new AnimalController(connection);
        //récupération de l'animal
        const animal = await animalController.getAnimalById(Number.parseInt(req.params.id));
        if (animal === null) {
            res.status(404).end();
        } else {
            res.json(animal);
        }
    }
    res.status(403).end();
});

/**
 * modification d'un animal selon son id
 * URL : /zoo/animal/:id
 * Requete : PUT
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
animalRouter.put("/:id",authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const id = Number.parseInt(req.params.id);
        const name = req.body.name;
        const age = Number.parseInt(req.body.age) || undefined;
        const spaceId = Number.parseInt(req.body.spaceId);

        //invalide s'il n'y a pas d'Id ou qu'aucune option à modifier n'est renseignée
        if (id === undefined) {
            res.status(400).end();
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const animalController = new AnimalController(connection);
        //modification
        const animal = await animalController.updateAnimal({
            id: id,
            name: name,
            age: age,
            spaceId: spaceId
        });
        if (typeof animal === "string") {
            res.status(403).end(animal);
            return;
        }
        if (animal === null) {
            res.status(404);
        } else {
            res.json(animal);
        }
    }
    res.status(403).end();
});

/**
 * suppression d'un animal selon son id
 * URL : /zoo/animal/:id
 * Requete : DELETE
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
animalRouter.delete("/:id", authUserMiddleWare,async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
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
    }
    res.status(403).end();
});

/**
 * ajout d'un animal
 * URL : /zoo/animal/add
 * Requete : POST
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
animalRouter.post("/add", authUserMiddleWare,async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const animalController = new AnimalController(connection);
        const speciesController = new SpeciesController(connection);
        //animal_id Max en base
        const id = await animalController.getMaxAnimalId() + 1;
        const name = req.body.name;
        const age = Number.parseInt(req.body.age);
        const species = await speciesController.getSpeciesByName(req.body.speciesName);
        const speciesId = species?.id;
        const spaceId = Number.parseInt(req.body.space);
        //toutes les informations sont obligatoires

        if ( name === undefined ) {
            res.status(400).end();
            return;
        }
        //Ajout d'un animal
        if (speciesId !== undefined && spaceId !== undefined) {
            const animal = await animalController.createAnimal({
                id,
                name,
                age,
                speciesId,
                spaceId
            });
            if (typeof animal === "string") {
                res.status(403).end(animal);
                return;
            }
            if (animal !== null) {
                res.status(201);
                res.json(animal);
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
    animalRouter
}
