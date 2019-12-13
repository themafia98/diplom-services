import express, { Application } from "express";
import _ from 'lodash';
import helmet from "helmet";
import chalk from "chalk";
import { Route } from "../../Utils/Interfaces";
import RouterInstance from "../Router";
import { Server as HttpServer } from "http";
import { ServerRun, App } from "../../Utils/Interfaces";

import Tasks from '../../Controllers/Tasks';
import Database from "../Database";
import Security from "../Security";

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

    public start(): void {

        this.setApp(express());
        this.getApp().disabled("x-powerd-by");
        this.getApp().use(helmet());
        this.getApp().set("port", this.getPort());

        const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

        const server: HttpServer = this.getApp().listen(this.getPort(), (): void => {
            console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green("started")}`);
            console.log(`Server or worker listen on ${chalk.blue.bold(this.port)}.`);
        });

        /** initial entrypoint route */
        instanceRouter.initInstance("/rest");

        this.getApp().locals.hash = new Security.Crypto();
        this.getApp().locals.dbm = new Database.ManagmentDatabase("controllSystem", <string>process.env.MONGODB_URI);

        Tasks.module(<App>this.getApp(), instanceRouter.createRoute("/tasks"));

        process.on("SIGTERM", (): void => {
            console.log("SIGTERM, uptime:", process.uptime());
            server.close();
        });
    }
}

export default ServerRunner;
