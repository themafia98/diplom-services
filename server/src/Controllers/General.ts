import { Router as RouteExpress, Request, Response, NextFunction } from "express";
import _ from "lodash";
import passport from "passport";
import multer from "multer";
import { UserModel } from "../Models/Database/Schema";
import { App } from "../Utils/Interfaces";
import Auth from '../Models/Auth';


namespace General {
    const upload = multer(); // form-data
    export const module = (app: App, route: RouteExpress): null | void => {
        if (!app) return null;

        route.get("/auth", Auth.config.required, (req: Request, res: Response, next: NextFunction) => {

            res.sendStatus(200);
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
            "/login", Auth.config.optional, async (req: Request, res: Response, next): Promise<any> => {
                const { body = {} } = req;
                if (!body || body && _.isEmpty(body)) return void res.sendStatus(503);
                return await passport.authenticate('local', function (err: Error, user: any): any {
                    console.log(user);
                    if (!user) {
                        return void res.sendStatus(401);
                    } else {

                        user.token = user.generateJWT();
                        return res.json({ user: user.toAuthJSON() });
                    }
                })(req, res, next);
            }
        );

        route.post("/logout", (req: Request, res: Response) => {
            // Get rid of the session token. Then call `logout`; it does no harm.
            console.log("logout");
            (<any>req).logout();
            console.log((<any>req).user);
            delete (<any>req).user;
            req.session.destroy(function (err) {
                if (err) { return res.sendStatus(400); }
                res.clearCookie("sid");
                // The response should indicate that the user is no longer authenticated.
                return res.redirect("/");
            });

        });
    };
}

export default General;
