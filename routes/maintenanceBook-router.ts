import express from "express";
import {MaintenanceBookController, SpaceController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {isClientConnected} from "../Utils";
import {LogError} from "../models";

const maintenanceBookRouter = express.Router();

/**
 * Récupération du carnet de maintenance d'un espace
 * URL : /zoo/maintenanceBook
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
maintenanceBookRouter.get("/:id", authUserMiddleWare, async function (req, res) {
    // vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const maintenanceBookController = new MaintenanceBookController(connection);
        const spaceId = Number.parseInt(req.params.id);
        const date = new Date();
        let str = [];

        if (!isNaN(spaceId)) {
            const spaceController = new SpaceController(connection);
            const space = await spaceController.getSpaceById(spaceId);
            const maintenanceBook = await maintenanceBookController.getAffluenceArray(spaceId);
            if (!(maintenanceBook instanceof LogError)) {
                if (!(space instanceof LogError)) {
                    str = maintenanceBook.displayArrays();
                    str[0] = "Fréquentation de l'espace '" + space.spaceName + "' en " + (date.getFullYear() - 1) + " :";
                    res.json(str);
                } else {
                    LogError.HandleStatus(res, {numError: 404, text: "This space doesn't exist"})
                }
            } else {
                LogError.HandleStatus(res, maintenanceBook);
            }
        } else {
            LogError.HandleStatus(res, {numError: 400});
        }
    }
    LogError.HandleStatus(res, {numError: 403, text: "Vous n'avez pas les droits d'accès"});
});

export {
    maintenanceBookRouter
}
