import express, { Request, Response, Application, Router as RouteExpress } from "express";
import _ from 'lodash';
import helmet from "helmet";
import chalk from "chalk";
import { Route } from "../../Utils/Interfaces";
import RouterInstance from "../Router";
import { Server as HttpServer } from "http";
import { ServerRun } from "../../Utils/Interfaces";

import Database from "../Database";

class ServerRunner implements ServerRun {
    private port: string;
    private application: null | Application = null;

    constructor(port: string) {
        this.port = port;
    }

    public getApp(): Application {
        return <Application>this.application;
    }

    public setApp(express: Application): void {
        if (_.isNull(this.application)) this.application = express;
    }

    public start(): void {
        this.setApp(express());
        this.getApp().disabled("x-powerd-by");
        this.getApp().use(helmet());
        this.getApp().set("port", this.port);

        const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

        const server: HttpServer = this.getApp().listen(this.port, (): void => {
            console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green("started")}`);
            console.log(`Server or worker listen on ${chalk.blue.bold(this.port)}.`);
        });

        const rest: RouteExpress = instanceRouter.initInstance("/rest");

        this.getApp().locals.dbm = new Database.ManagmentDatabase("controllSystem", <string>process.env.MONGODB_URI);

        process.on("SIGTERM", (): void => {
            server.close();
        });
    }
}

export default ServerRunner;
