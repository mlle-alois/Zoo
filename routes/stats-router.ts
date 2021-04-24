import express from "express";
import {SpaceController, StatsController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {authUserMiddleWare} from "../middlewares/auth-middleware";
import {DateUtils, isClientConnected} from "../Utils";
import {LogError} from "../models";

const statsRouter = express.Router();

/**
 * Récupération des statistiques d'un enclos
 * URL : /zoo/stats?[limit={x}&offset={x}]
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
statsRouter.get("/:query", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const statsController = new StatsController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const spaceId = Number.parseInt(req.body.spaceId);

        if (!isNaN(spaceId) && req.body.date !== undefined) {
            let date = new Date(req.body.date);
            const spaceController = new SpaceController(connection);
            const space = await spaceController.getSpaceById(spaceId);
            DateUtils.addXHoursToDate(date, 2);
            let str;
            let stats;

            switch (req.params.query) {
                case "day" :
                    stats = await statsController.getStatsByDay(spaceId, date, {limit, offset});
                    if (!(space instanceof LogError) && !(stats instanceof LogError)) {
                        str = "L'affluence de l'espace " + "'" + space.spaceName + "'" + " le " + ("0" + date.getUTCDate()).slice(-2) + "/"
                            + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getFullYear()).slice(-2) + " est de : " + stats.affluenceDay;
                    }
                    break;

                case "week" :
                    stats = await statsController.getStatsByWeek(spaceId, date, {limit, offset});
                    if (!(space instanceof LogError) && !(stats instanceof LogError)) {
                        str = "L'affluence de l'espace " + "'" + space.spaceName + "'" + " la semaine du " + ("0" + date.getUTCDate()).slice(-2) + "/"
                            + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getFullYear()).slice(-2) + " est de : " + stats.affluenceWeek;
                    }
                    break;

                case "month" :
                    stats = await statsController.getStatsByMonth(spaceId, date, {limit, offset});
                    if (!(space instanceof LogError) && !(stats instanceof LogError)) {
                        str = "L'affluence de l'espace " + "'" + space.spaceName + "'" + " le mois de " +
                            new Intl.DateTimeFormat('fr-FR', {month: "long"}).format(date) + " " + date.getFullYear() + " est de : " +
                            stats.affluenceMonth;
                    }
                    break;

                case "year" :
                    stats = await statsController.getStatsByYear(spaceId, date, {limit, offset});
                    if (!(space instanceof LogError) && !(stats instanceof LogError)) {
                        str = "L'affluence de l'espace " + "'" + space.spaceName + "'" + " pour l'année " +
                            date.getFullYear() + " est de : " + stats.affluenceYear;
                    }
                    break;

                default :
                    stats = new LogError({numError: 400});
                    break;
            }

            if (stats instanceof LogError) {
                LogError.HandleStatus(res, stats);
            } else {
                if (!(space instanceof LogError)) {
                    res.json(str);
                } else {
                    LogError.HandleStatus(res, {numError: 404, text: "This space doesn't exist"})
                }
                return;
            }
        } else {
            LogError.HandleStatus(res, {numError: 400});
        }
    }
    LogError.HandleStatus(res, {numError: 403, text: "Vous n'avez pas les droits d'accès"});
});

/**
 * Récupération des statistiques d'un enclos
 * URL : /zoo/stats/
 * Requete : GET
 * ACCES : Tous sauf CLIENT
 * Nécessite d'être connecté : OUI
 */
statsRouter.get("/", authUserMiddleWare, async function (req, res) {
    //vérification droits d'accès
    if (!await isClientConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const statsController = new StatsController(connection);
        const zooStatsList = await statsController.getZooStats();

        if (!(zooStatsList instanceof LogError)) {
            res.json(zooStatsList);
        } else {
            LogError.HandleStatus(res, zooStatsList);
        }
    }
    LogError.HandleStatus(res, {numError: 403, text: "Vous n'avez pas les droits d'accès"});
});

export {
    statsRouter
}
