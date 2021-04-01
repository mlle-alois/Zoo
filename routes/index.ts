import {Express} from "express";
import {authRouter} from "./auth-router";
import {userRouter} from "./user-router";
import {speciesRouter} from "./species-router"
import {spaceTypeRouter} from "./space-type-router";

export function buildRoutes(app: Express) {
    app.use("/auth", authRouter);
    app.use("/zoo/user", userRouter);
    app.use("/zoo/species", speciesRouter);
    app.use("/zoo/space-type", spaceTypeRouter);
}