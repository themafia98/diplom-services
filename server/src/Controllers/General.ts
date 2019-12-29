import { Response, NextFunction, Application } from "express";
import _ from "lodash";
import passport from "passport";
import { UserModel } from "../Models/Database/Schema";
import { Request, App, BodyLogin } from "../Utils/Interfaces";

import Decorators from "../Decorators";

namespace General {
    const Post = Decorators.Post;
    const Delete = Decorators.Delete;
    const Controller = Decorators.Controller;
    @Controller("/")
    export class Main {
        @Post({ path: "/auth", private: true })
        public auth(req: Request, res: Response): Response {
            return res.sendStatus(200);
        }

        @Post({ path: "/reg", private: false })
        public async reg(req: Request, res: Response, next: NextFunction, server: App): Promise<void> {
            try {
                if (!req.body || (req.body && _.isEmpty(req.body))) throw new Error("Invalid auth data");
                const service = server.locals;
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

        @Post({ path: "/login", private: false })
        public async login(req: Request, res: Response, next: NextFunction) {
            const body: BodyLogin = req.body;
            if (!body || (body && _.isEmpty(body))) return void res.sendStatus(503);
            return await passport.authenticate(
                "local",
                async (err: Error, user: any): Promise<Response | void> => {
                    try {
                        if (!user || err) {
                            return res.status(401).send("Пользователь не найден, проверьте введеные данные.");
                        }
                        const { password = "" } = body;

                        const isValidPassword = await user.checkPassword(password).catch((err: Error) => {
                            console.error(err);
                            return res.status(503).send("Ошибка авторизации.");
                        });
                        if (!isValidPassword) {
                            return res.status(401).send("Неверные данные для авторизации.");
                        }
                        user.token = user.generateJWT();
                        req.login(user, (err: Error) => {
                            if (err) {
                                res.status(404).send(err.message);
                            }
                            return res.json({ user: user.toAuthJSON() });
                        });
                    } catch (err) {
                        console.error(err);
                        return res.status(503).send("Ошибка авторизации.");
                    }
                }
            )(req, res, next);
        }

        @Post({ path: "/userload", private: true })
        public async userload(req: Request, res: Response) {
            if (req.user) return res.json({ user: (<any>req).user.toAuthJSON() });
            else {
                res.clearCookie("connect.sid");
                return res.sendStatus(302);
            }
        }

        @Delete({ path: "/logout", private: true })
        public async logout(req: Request, res: Response): Promise<void> {
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
