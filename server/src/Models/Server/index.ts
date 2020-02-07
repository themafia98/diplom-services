import express, { Application, Response, NextFunction, Router } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import socketio from 'socket.io';
import passport from "passport";
import _ from "lodash";
import helmet from "helmet";
import chalk from "chalk";
import { Route } from "../../Utils/Interfaces";
import RouterInstance from "../Router";
import { Server as HttpServer } from "http";
import { ServerRun, App, Request, Rest } from "../../Utils/Interfaces";
import Utils from "../../Utils";
import System from "../../Controllers/Main";
import General from "../../Controllers/General";
import Chat from "../../Controllers/Contact/Chat";
import Tasks from "../../Controllers/Tasks";
import News from "../../Controllers/Contact/News";
import Database from "../Database";

import DropboxStorage from '../../Services/Dropbox';

import { UserModel } from "../Database/Schema";

import jwt, { StrategyOptions } from "passport-jwt";
import * as passportLocal from 'passport-local';

import WebSocketWorker from "../WebSocketWorker";
import Entrypoint from "../..";

namespace Http {

    const LocalStrategy = passportLocal.Strategy;

    abstract class RestEntitiy implements Rest {
        private port: string;
        private rest: Application | undefined;
        private application: null | Application = null;

        constructor(port: string) {
            this.port = port;
        }

        public getPort(): string {
            return this.port;
        }

        public getRest(): Application {
            return <Application>this.rest;
        }

        public setRest(route: Application): void {
            if (!this.rest) {
                this.rest = route;
            }
        }

        public getApp(): Application {
            return <Application>this.application;
        }

        public setApp(express: Application): void {
            if (_.isNull(this.application)) this.application = express;
        }
    }

    export class ServerRunner extends RestEntitiy {

        constructor(port: string) {
            super(port);
        }

        public startResponse(req: Request, res: Response, next: NextFunction): void {
            req.start = new Date();
            next();
        }

        public isPrivateRoute(req: Request, res: Response, next: NextFunction): Response | void {
            if (req.isAuthenticated()) {
                return next();
            } else {
                res.clearCookie("connect.sid");
                return res.sendStatus(404);
            }
        }

        public initErrorHandler(server: HttpServer, dbm: Readonly<Database.ManagmentDatabase>): void {
            server.on("clientError", (err, socket) => {
                console.log("clientError");
                console.error(err);
                socket.destroy();
            });

            process.on("SIGTERM", (): void => {
                console.log("SIGTERM, uptime:", process.uptime());
                server.close();
            });

            process.on("uncaughtException", (err: Error) => {
                // handle the error safely
                if (err.name === "MongoNetworkError") {
                    dbm.disconnect().catch((err: Error) => console.error(err));
                    console.log("uncaughtException. uptime:", process.uptime());
                    console.error(err);
                } else {
                    console.error(err);
                    console.log("exit error, uptime:", process.uptime());
                    process.exit(1);
                }
            });
        }

        public errorLogger(err: Error, req: Request, res: Response, next: NextFunction): void {
            // set locals, only providing error in development
            const today: Readonly<Date> = new Date();
            const time: Readonly<string> = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            const day: Readonly<string> = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            console.error(err.name);
            if (!err.name) next();
            else {
                console.error(err.name);
                next();
            }
            // if (err.name) console.error(`${err.name} / ${day}/${time}`);
        }

        public initJWT(dbm: Readonly<Database.ManagmentDatabase>): void {
            passport.use(
                new LocalStrategy(
                    {
                        usernameField: "email",
                        passwordField: "password"
                    },
                    async (email: string, password: string, done: Function) => {
                        try {
                            const connect = await dbm.connection();
                            if (!connect) throw new Error("Bad connect");
                            UserModel.findOne({ email }, async (err: Error, user: Record<string, any>) => {
                                await dbm.disconnect().catch((err: Error) => console.error(err));
                                if (err) return done(err);
                                else if (!user || !user.checkPassword(password)) {
                                    return done(null, false, {
                                        message: "Нет такого пользователя или пароль неверен."
                                    });
                                } else {
                                    return done(null, user);
                                }
                            });
                        } catch (err) {
                            console.error(err);
                            return done(err);
                        }
                    }
                )
            );

            const jwtOptions: Readonly<object> = {
                jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
                secretOrKey: "jwtsecret"
            };

            passport.use(
                new jwt.Strategy(<StrategyOptions>jwtOptions,
                    async function (payload: Partial<{ id: string }>, done: Function) {
                        try {
                            const connect = await dbm.connection();
                            if (!connect) throw new Error("bad connection");
                            UserModel.findOne(payload.id, async (err: Error, user: Record<string, any>) => {
                                await dbm.disconnect().catch((err: Error) => console.error(err));

                                if (err) {
                                    return done(err);
                                }
                                if (user) {
                                    done(null, user);
                                } else {
                                    done(null, false);
                                }
                            });
                        } catch (err) {
                            return done(err);
                        }
                    })
            );

            passport.serializeUser((user: Partial<{ id: string }>, done: Function) => {
                done(null, user.id);
            });

            passport.deserializeUser(async (id: string, done: Function) => {
                try {
                    const connect = await dbm.connection();
                    if (!connect) throw new Error("Bad connect");
                    await UserModel.findById(id, async (err: Error, user: Record<string, any>) => {
                        if (err) {
                            console.log(err);
                            console.log(user);
                        }
                        await dbm.disconnect().catch((err: Error) => console.error(err));
                        done(err, user);
                    }).catch(err => {
                        done(err, null);
                    });
                } catch (err) {
                    console.error(err);
                    return done(err);
                }
            });
        }

        public async start(): Promise<void> {
            const { wsWorkers = [] } = Entrypoint || {};
            const Main: Readonly<Function> = General.Main;
            const TasksController: Readonly<Function> = Tasks.TasksController;
            const SystemData: Readonly<Function> = System.SystemData;
            const NewsController: Readonly<Function> = News.NewsController;
            const ChatAlias: Readonly<Function> = Chat.ChatController;

            this.setApp(express());
            this.getApp().disabled("x-powerd-by");
            this.getApp().use(helmet());
            this.getApp().use(express.urlencoded({ extended: true }));
            this.getApp().use(express.json());
            this.getApp().set("port", this.getPort());

            const SessionStore = MongoStore(session);
            const MONGODB_URI: Readonly<string> = <string>process.env.MONGODB_URI;
            const DROPBOX_TOKEN: Readonly<string> = <string>process.env.DROPBOX_TOKEN;

            this.getApp().use(
                session({
                    secret: "jwtsecret",
                    saveUninitialized: true,
                    resave: true,
                    store: new SessionStore({
                        url: MONGODB_URI,
                        collection: "sessions"
                    })
                })
            );
            this.getApp().use(passport.initialize());
            this.getApp().use(passport.session());
            this.getApp().use(this.errorLogger);

            const dbm: Readonly<Database.ManagmentDatabase> = new Database.ManagmentDatabase(
                "controllSystem",
                MONGODB_URI
            );

            const dropbox = new DropboxStorage.DropboxManager({ token: DROPBOX_TOKEN });

            this.getApp().locals.dbm = dbm;
            this.getApp().locals.dropbox = dropbox;
            this.initJWT(dbm);

            const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

            const server: HttpServer = this.getApp().listen(this.getPort(), (): void => {
                console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green("started")}`);
                console.log(`Server listen on ${chalk.blue.bold(this.getPort())}.`);
            });


            /** initial entrypoint route */
            this.setRest(instanceRouter.initInstance("/rest"));
            this.getRest().use(this.startResponse);

            const wsWorkerManager: WebSocketWorker = new WebSocketWorker(wsWorkers);
            wsWorkerManager.startSocketConnection(socketio(server));

            Utils.initControllers(
                [
                    Main,
                    TasksController,
                    NewsController,
                    SystemData,
                    ChatAlias
                ],
                this.getApp.bind(this),
                this.getRest.bind(this),
                this.isPrivateRoute.bind(this),
                wsWorkerManager,
            );

            this.initErrorHandler(server, dbm);
        }
    }

}

export default Http;
