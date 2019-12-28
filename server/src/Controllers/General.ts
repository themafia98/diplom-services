import { Router as RouteExpress, Response, NextFunction } from "express";
import _ from "lodash";
import passport from "passport";
//import multer from "multer";
import { UserModel } from "../Models/Database/Schema";
import { App, Request } from "../Utils/Interfaces";
import Auth from '../Models/Auth';

import Decorators from '../Decorators';
const Get = Decorators.Get;
const Controller = Decorators.Controller;

namespace General {
    // const upload = multer(); // form-data

    export const isPrivateRoute = (req: Request, res: Response, next: NextFunction): Response | void => {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.clearCookie("connect.sid");
            return res.sendStatus(404);
        }
    };

    @Controller("/rest")
    export class Test {
        @Get("/test")
        public test(req: Request, res: Response) {
            return res.send("test");
        }
    }

    export const module = (app: App, route: RouteExpress): null | void => {
        if (!app) return null;

        route.post("/auth", isPrivateRoute, (req: Request, res: Response, next: NextFunction): void => {
            return void res.sendStatus(200);
        });

        route.post(
            "/reg",
            async (req: Request, res: Response): Promise<void> => {
                try {
                    if (!req.body || (req.body && _.isEmpty(req.body))) throw new Error("Invalid auth data");
                    const service = app.locals;
                    service.dbm.connection().then(async () => {
                        await UserModel.create({ ...req.body, accept: true, rules: "full" }, async (err: Error) => {
                            await service.dbm.disconnect();
                            console.error(err);
                            if (err) return void res.sendStatus(400);
                            return void res.sendStatus(200);
                        });
                    });
                } catch (err) {
                    return void res.sendStatus(400);
                }
            });

        route.post(
            "/login",
            Auth.config.optional,
            async (req: Request, res: Response, next): Promise<any> => {
                const { body = {} } = req;
                if (!body || (body && _.isEmpty(body))) return void res.sendStatus(503);
                return await passport.authenticate("local", function (err: Error, user: any): any {
                    if (!user) {
                        return void res.sendStatus(401);
                    } else {
                        user.token = user.generateJWT();
                        req.login(user, (err: Error) => {
                            if (err) {
                                return next(err);
                            }
                            return res.json({ user: user.toAuthJSON() });
                        });
                    }
                })(req, res, next);
            });

        route.post("/userload", isPrivateRoute, (req: Request, res: Response, next: NextFunction) => {
            if (req.user) return res.json({ user: (<any>req).user.toAuthJSON() });
            else {
                res.clearCookie("connect.sid");
                return res.sendStatus(302);
            }
        });

        route.delete("/logout", isPrivateRoute, (req: Request, res: Response, next: NextFunction) => {
            req.session.destroy((err: Error) => {
                if (err) console.error(err);
                <any>req.logOut(); // passportjs logout
                res.clearCookie("connect.sid");
                return res.sendStatus(200);
            });
        })
    };
}

export default General;
