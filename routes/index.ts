import {Express} from "express";
import {authRouter} from "./auth-router";
import userRouter from "./user-router";

export function buildRoutes(app: Express) {
    app.use("/auth", authRouter);
    app.use("/zoo/user", userRouter);
}