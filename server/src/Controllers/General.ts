import { Router as RouteExpress, Request, Response } from "express";
import _ from "lodash";
import passport from "passport";
import multer from "multer";
import { UserModel } from "../Models/Database/Schema";
import { App } from "../Utils/Interfaces";
import jwt from "jsonwebtoken";

namespace General {
    const upload = multer(); // form-data
    export const module = (app: App, route: RouteExpress): null | void => {
        if (!app) return null;

        route.use("/api", async (req: Request, res: Response, next: Function) => {
            try {
                await passport.authenticate("jwt", (err: Error, user: any) => {
                    if (err || !user) {
                        if (req.session) {
                            req.session.destroy(function() {
                                res.clearCookie("jwtsecret");
                                res.redirect("/");
                            });
                        } else res.redirect("/");
                    } else next();
                });
            } catch (err) {
                if (req.session) {
                    req.session.destroy(function() {
                        res.clearCookie("jwtsecret");
                        res.redirect("/");
                    });
                } else res.redirect("/");
            }
        });

        route.post(
            "/reg",
            upload.any(),
            async (req: Request, res: Response): Promise<void> => {
                try {
                    console.log(req.body);
                    if (!req.body || (req.body && _.isEmpty(req.body))) throw new Error("Invalid auth data");
                    const service = app.locals;
                    service.dbm.connection().then(async () => {
                        console.log("connect");
                        await UserModel.create({ ...req.body, accept: true, rules: "full" }, async (err: Error) => {
                            console.log(err);
                            if (err) return void res.sendStatus(400);
                            await service.dbm.disconnect();
                            return void res.sendStatus(200);
                        });
                    });
                } catch (err) {
                    return void res.sendStatus(400);
                }
            }
        );

        route.post(
            "/login",
            async (req: Request, res: Response): Promise<void> => {
                try {
                    if (!req.body) throw new Error("Invalid auth data");
                    await passport.authenticate("local", function(err, user) {
                        const payload = {
                            id: user.id,
                            email: user.email,
                            displayName: user.displayName
                        };

                        const token = jwt.sign(payload, "jwtsecret");
                        res.json({ user: user.displayName, token: "JWT " + token });
                    })(req.body);
                } catch (err) {
                    res.status(400).json(err);
                }
            }
        );

        route.get("/logout", (req: Request, res: Response) => {
            if (req.session) {
                req.session.destroy(function() {
                    res.clearCookie("jwtsecret");
                    res.redirect("/");
                });
            } else res.redirect("/");
        });
    };
}

export default General;
