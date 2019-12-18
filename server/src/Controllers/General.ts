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

        route.get("/auth", (req: Request, res: Response, next: NextFunction) => {
            if ((<any>req).headers.authorization.includes("Token")) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
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

        route.get("/logout", (req: Request, res: Response) => {
            (<any>req).logout();
            (<any>res).redirect("/");

        });
    };
}

export default General;
