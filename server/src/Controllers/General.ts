import { Response, NextFunction } from "express";
import _ from "lodash";
import passport from "passport";
import { UserModel } from "../Models/Database/Schema";
import { ResRequest } from '../Utils/Types';
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
        public async reg(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                if (!req.body || (req.body && _.isEmpty(req.body))) throw new Error("Invalid auth data");

                console.log("body:", req.body);

                const service = server.locals;
                const connect = await service.dbm.connection();

                if (!connect) {
                    console.log("Connect reg:", connect);
                    return res.sendStatus(503);
                }


                await UserModel.create({ ...req.body, accept: true, rules: "full" }, async (err: Error): ResRequest => {

                    if (err) {
                        console.error(err);
                        return res.sendStatus(400);
                    }
                    if (!res.headersSent)
                        return res.sendStatus(200);
                });

            } catch (err) {
                console.error(err);
                if (!res.headersSent) return res.sendStatus(400);
            }
        }

        @Post({ path: "/login", private: false })
        public async login(req: Request, res: Response, next: NextFunction) {
            const body: BodyLogin = req.body;
            if (!body || (body && _.isEmpty(body))) return void res.sendStatus(503);

            return await passport.authenticate(
                "local",
                async (err: Error, user: Record<string, any>): ResRequest => {
                    try {
                        if (!user || err) {
                            return res.status(401).send("Пользователь не найден, проверьте введеные данные.");
                        }
                        const { password = "" } = body;

                        const isValidPassword = await user.checkPassword(password).catch((err: Error): Response => {
                            console.error(err);
                            return res.status(503).send("Ошибка авторизации.");
                        });

                        if (res.headersSent) return;

                        if (!isValidPassword) {
                            return res.status(401).send("Неверные данные для авторизации.");
                        }
                        user.token = user.generateJWT();
                        req.login(user, (err: Error): Response => {
                            if (err) {
                                res.status(404).send(err.message);
                            }
                            return res.json({ user: user.toAuthJSON() });
                        });
                    } catch (err) {
                        console.error(err);
                        if (!res.headersSent)
                            return res.status(503).send("Ошибка авторизации.");
                    }
                }
            )(req, res, next);
        }

        @Post({ path: "/userload", private: true })
        public async userload(req: Request, res: Response): Promise<Response> {
            if (req.user) return res.json({ user: (req as Record<string, any>).user.toAuthJSON() });
            else {
                res.clearCookie("connect.sid");
                return res.sendStatus(302);
            }
        }

        @Delete({ path: "/logout", private: true })
        public async logout(req: Request, res: Response): Promise<Response> {
            return await req.session.destroy((err: Error): Response => {
                if (err) console.error(err);
                req.logOut(); // passportjs logout
                res.clearCookie("connect.sid");
                return res.sendStatus(200);
            });
        }
    }
}

export default General;
