import express from "express";
import {UserController} from "../controllers";
import {DatabaseUtils} from "../database/database";

const router = express.Router();

router.get("/", async function (req, res) {
    const connection = await DatabaseUtils.getConnexion();
    const userController = new UserController(connection);
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
    const userList = await userController.getAll({
        limit,
        offset
    });
    res.json(userList);
});

router.get("/:id", async function (req, res) {
    const connection = await DatabaseUtils.getConnexion();
    const userController = new UserController(connection);
    const user = await userController.getById(req.params.id);
    if (user === null) {
        res.status(404).end();
    } else {
        res.json(user);
    }
});

//modifier
router.put("/:id", async function (req, res) {
    const id = req.params.id;
    const mail = req.body.mail;
    const password = req.body.password;
    const name = req.body.name;
    const firstname = req.body.firstname;
    const phoneNumber = req.body.phoneNumber;
    const typeId = req.body.typeId;
    if (id === undefined || (mail === undefined && password === undefined &&
        name === undefined && firstname === undefined
        && phoneNumber === undefined && typeId === undefined)) {
        res.status(400).end();
        return;
    }
    const connection = await DatabaseUtils.getConnexion();
    const userController = new UserController(connection);
    //TODO implémenter dans user-controller
    /*const user = await userController.update({
        id,
        name,
        capacity: capacity !== undefined ? Number.parseInt(capacity) : undefined,
        price: price !== undefined ? Number.parseFloat(price) : undefined
    });
    if (user === null) {
        res.status(404);
    } else {
        res.json(user);
    }*/
});

//supprimer
router.delete("/:id", async function (req, res) {
    const connection = await DatabaseUtils.getConnexion();
    const userController = new UserController(connection);
    //TODO implémenter dans user-controller
    /*const success = await userController.removeById(req.params.id);
    if (success) {
        // pas de contenu mais a fonctionné
        res.status(204).end();
    } else {
        res.status(404).end();
    }*/
});

export default router;