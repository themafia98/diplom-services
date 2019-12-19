import express, { Application, Request, Response, NextFunction, Router } from "express";
import session, { SessionOptions } from "express-session";
import MongoStore from 'connect-mongo';
import passport from "passport";
import _ from "lodash";
import helmet from "helmet";
import chalk from "chalk";
import { Route } from "../../Utils/Interfaces";
import RouterInstance from "../Router";
import { Server as HttpServer } from "http";
import { ServerRun, App } from "../../Utils/Interfaces";

import General from "../../Controllers/General";
import Tasks from "../../Controllers/Tasks";
import Database from "../Database";

import { UserModel } from "../Database/Schema";

const jwt = require("passport-jwt");
const LocalStrategy = require("passport-local");

class ServerRunner implements ServerRun {
    private port: string;
    private application: null | Application = null;

    constructor(port: string) {
        this.port = port;
    }

    public getPort(): string {
        return this.port;
    }

    public getApp(): Application {
        return <Application>this.application;
    }

    public setApp(express: Application): void {
        if (_.isNull(this.application)) this.application = express;
    }

    public startResponse(req: Request, res: Response, next: NextFunction): void {
        (<any>req).start = new Date();
        next();
    }

    public start(): void {
        this.setApp(express());
        this.getApp().use(passport.initialize());
        this.getApp().disabled("x-powerd-by");
        this.getApp().use(helmet());
        this.getApp().use(express.urlencoded({ extended: true }));
        this.getApp().use(express.json());
        this.getApp().set("port", this.getPort());
        const SessionStore = MongoStore(session);

        this.getApp().use(session({
            secret: "jwtsecret",
            saveUninitialized: true,
            resave: true,
            store: new SessionStore({
                url: process.env.MONGODB_URI,
                collection: 'sessions'
            })
        }));
        this.getApp().use(passport.session());

        const dbm = new Database.ManagmentDatabase("controllSystem", <string>process.env.MONGODB_URI);
        this.getApp().locals.dbm = dbm;

        passport.use(
            new LocalStrategy(
                {
                    usernameField: "email",
                    passwordField: "password"
                },
                async (email: string, password: string, done: Function) => {
                    console.log(password);
                    await dbm.connection();
                    UserModel.findOne({ email }, async (err: Error, user: any) => {

                        await dbm.disconnect();
                        if (err) return done(err);

                        else if (!user || !user.checkPassword(password)) {
                            return done(null, false, {
                                message: "Нет такого пользователя или пароль неверен."
                            });
                        } else {

                            return done(null, user);
                        }
                    });
                }
            )
        );

        const jwtOptions = {
            jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
            secretOrKey: "jwtsecret"
        };

        passport.use(
            new jwt.Strategy(jwtOptions, async function (payload: any, done: Function) {
                await dbm.connection();
                console.log("jwt");
                UserModel.findOne(payload.id, async (err: Error, user: any) => {
                    await dbm.disconnect();

                    if (err) {
                        return done(err);
                    }
                    if (user) {
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            })
        );

        passport.serializeUser(function (user: any, done) {
            done(null, user.id);
        });

        passport.deserializeUser(async function (id, done) {
            console.log(id);
            await dbm.connection();
            UserModel.findById(id, async function (err, user: any) {
                await dbm.disconnect();
                done(err, user);
            });
        });

        const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

        const server: HttpServer = this.getApp().listen(this.getPort(), (): void => {
            console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green("started")}`);
            console.log(`Server or worker listen on ${chalk.blue.bold(this.port)}.`);
        });

        /** initial entrypoint route */
        const rest = instanceRouter.initInstance("/rest");
        const tasksRoute: Router = instanceRouter.createRoute("/api/tasks");

        General.module(<App>this.getApp(), rest);
        tasksRoute.use(this.startResponse);

        Tasks.module(<App>this.getApp(), tasksRoute);

        process.on("SIGTERM", (): void => {
            console.log("SIGTERM, uptime:", process.uptime());
            server.close();
        });
    }
}

export default ServerRunner;
