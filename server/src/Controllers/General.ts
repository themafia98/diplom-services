import { Router as RouteExpress, Response, NextFunction } from "express";
import _ from "lodash";
import passport from "passport";
//import multer from "multer";
import { UserModel } from "../Models/Database/Schema";
import { App, Request } from "../Utils/Interfaces";
import Auth from '../Models/Auth';


namespace General {
    // const upload = multer(); // form-data

    export const isPrivateRoute = (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            return res.sendStatus(404);
        }
    };

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
            }
        );

        route.post(
            "/login", Auth.config.optional, async (req: Request, res: Response, next): Promise<any> => {
                const { body = {} } = req;
                if (!body || body && _.isEmpty(body)) return void res.sendStatus(503);
                return await passport.authenticate('local', function (err: Error, user: any): any {

                    if (!user) {
                        return void res.sendStatus(401);
                    } else {

                        user.token = user.generateJWT();
                        req.login(user, (err: Error) => {
                            if (err) { return next(err); }
                            return res.json({ user: user.toAuthJSON() });
                        });
                    }
                })(req, res, next);
            }
        );

        route.post("/logout", <any>isPrivateRoute,
            (req: Request, res: Response, next: NextFunction): void => {
                req.session.destroy((err: Error) => {
                    if (err) console.error(err);
                    (<any>req.logOut()); // passportjs logout
                    res.clearCookie("connect.sid");
                    return res.redirect("/");
                });
            });
    };
}

export default General;
