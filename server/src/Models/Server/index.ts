import express, { Application, Response, NextFunction, Router } from "express";
import session, { SessionOptions } from "express-session";
import MongoStore from "connect-mongo";

import passport from "passport";
import _ from "lodash";
import helmet from "helmet";
import chalk from "chalk";
import { Route } from "../../Utils/Interfaces";
import RouterInstance from "../Router";
import { Server as HttpServer } from "http";
import { ServerRun, App, Request, RouteDefinition } from "../../Utils/Interfaces";

import General from "../../Controllers/General";
import Chat from "../../Controllers/Contact/Chat";
import Tasks from "../../Controllers/Tasks";
import Database from "../Database";

import { UserModel } from "../Database/Schema";

const jwt = require("passport-jwt");
const LocalStrategy = require("passport-local");
const Test = General.Test;
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
        req.start = new Date();
        next();
    }

    public start(): void {
        this.setApp(express());
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
                url: <string>process.env.MONGODB_URI,
                collection: "sessions",
            })
        }));
        this.getApp().use(passport.initialize());
        this.getApp().use(passport.session());

        this.getApp().use((err: Error, req: Request, res: Response, next: NextFunction): void => {
            // set locals, only providing error in development
            const today = new Date();
            const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            const day = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            console.error(err.name);
            if (!err.name) next();
            else {
                console.error(err.name);
                next();
            }
            // if (err.name) console.error(`${err.name} / ${day}/${time}`);
        });

        const dbm = new Database.ManagmentDatabase("controllSystem", <string>process.env.MONGODB_URI);
        this.getApp().locals.dbm = dbm;

        passport.use(
            new LocalStrategy(
                {
                    usernameField: "email",
                    passwordField: "password"
                },
                async (email: string, password: string, done: Function) => {
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

        passport.serializeUser((user: any, done: Function) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id: string | number, done: Function) => {
            await dbm.connection();
            await UserModel.findById(id, async (err: Error, user: any) => {
                if (err) {
                    console.log(err);
                    console.log(user);
                }
                await dbm.disconnect();
                done(err, user);
            }).catch(err => {
                done(err, null);
            });
        });

        const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

        const server: HttpServer = this.getApp().listen(this.getPort(), (): void => {
            console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green("started")}`);
            console.log(`Server or worker listen on ${chalk.blue.bold(this.port)}.`);
        });

        server.on("clientError", (err, socket) => {
            console.log("clientError");
            console.error(err);
            socket.destroy();
        });

        /** initial entrypoint route */
        const rest = instanceRouter.initInstance("/rest");
        const tasksRoute: Router = instanceRouter.createRoute("/api/tasks");

        General.module(<App>this.getApp(), rest);
        tasksRoute.use(<any>this.startResponse);

        Tasks.module(<App>this.getApp(), tasksRoute);
        Chat.module(<App>this.getApp(), server);

        [
            Test
        ].forEach(controller => {
            // This is our instantiated class
            const instance: any = new controller();
            // The prefix saved to our controller
            const prefix = Reflect.getMetadata('prefix', controller);
            // Our `routes` array containing all our routes for this controller
            const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', controller);

            // Iterate over all routes and register them to our express application 
            routes.forEach(route => {
                // It would be a good idea at this point to substitute the `app[route.requestMethod]` with a `switch/case` statement
                // since we can't be sure about the availability of methods on our `app` object. But for the sake of simplicity
                // this should be enough for now.
                this.getApp()[route.requestMethod](prefix + route.path, (req: express.Request, res: express.Response) => {
                    // Execute our method for this path and pass our express request and response object.
                    instance[route.methodName](req, res);
                });
            });
        });

        process.on("SIGTERM", (): void => {
            console.log("SIGTERM, uptime:", process.uptime());
            server.close();
        });

        process.on("uncaughtException", function (err) {
            // handle the error safely
            if (err.name === "MongoNetworkError") {
                console.log("uncaughtException");
                console.log(err);
            } else process.exit(1);
        });
    }
}

export default ServerRunner;
