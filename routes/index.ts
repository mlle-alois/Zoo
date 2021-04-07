import {Express} from "express";
import {authRouter} from "./auth-router";
import {userRouter} from "./user-router";
import {speciesRouter} from "./species-router"
import {spaceTypeRouter} from "./space-type-router";
import {spaceRouter} from "./space-router";
import {presenceRouter} from "./presence-router";
import {passRouter} from "./pass-router";
import {animalRouter} from "./animal-router"
import {treatmentTypeRouter} from "./treatment-type-router";
import {treatmentRouter} from "./treatment-router";


export function buildRoutes(app: Express) {
    app.use("/auth", authRouter);
    app.use("/zoo/user", userRouter);
    app.use("/zoo/species", speciesRouter);
    app.use("/zoo/space-type", spaceTypeRouter);
    app.use("/zoo/space", spaceRouter);
    app.use("/zoo/presence", presenceRouter);
    app.use("/zoo/pass", passRouter);
    app.use("/zoo/animal", animalRouter);
    app.use("/zoo/treatment-type", treatmentTypeRouter);
    app.use("/zoo/treatment", treatmentRouter);
}