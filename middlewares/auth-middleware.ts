import express from "express";
import {AuthController} from "../controllers";

//TODO adapter sans sequelize
export async function authMiddleWare(req: express.Request, res: express.Response, next: express.NextFunction) {
    /*const auth = req.headers['authorization'];
    if(auth !== undefined) {
        const token = auth.slice(7);
        const authController = await AuthController.getInstance();
        const session = await authController.getSession(token);
        if(session !== null) {
            next();
            return;
        } else {
            //pas le droit d'y accéder
            res.status(403).end();
        }
    } else {
        //pas d'user connecté
        res.status(401).end();
    }*/
}