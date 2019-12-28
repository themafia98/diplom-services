import { Router as RouteExpress, Response, NextFunction, Application } from "express";
import _ from "lodash";
import passport from "passport";
//import multer from "multer";
import { UserModel } from "../Models/Database/Schema";
import { App, Request } from "../Utils/Interfaces";
import Auth from '../Models/Auth';

import Decorators from '../Decorators';

namespace General {
    const Post = Decorators.Post;
    const Delete = Decorators.Delete;
    const Controller = Decorators.Controller;
    @Controller("/")
    export class Main {
        @Post({ path: "/auth", private: true })
        public auth(req: Request, res: Response, next: NextFunction): Response {
            return res.sendStatus(200);
        }

        @Post({ path: "/reg", private: false })
        public async reg(req: Request, res: Response, next: NextFunction, app: Application): Promise<void> {
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
        };

        @Post({ path: "/login", private: false })
        public async login(req: Request, res: Response, next: NextFunction) {
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
        };

        @Post({ path: "/userload", private: true })
        public async userload(req: Request, res: Response, next: NextFunction) {
            if (req.user) return res.json({ user: (<any>req).user.toAuthJSON() });
            else {
                res.clearCookie("connect.sid");
                return res.sendStatus(302);
            }
        };

        @Delete({ path: "/logout", private: true })
        public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
            req.session.destroy((err: Error) => {
                if (err) console.error(err);
                <any>req.logOut(); // passportjs logout
                res.clearCookie("connect.sid");
                return res.sendStatus(200);
            });
        }
    }
}

export default General;
