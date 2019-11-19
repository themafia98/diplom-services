import express, { Request, Response, Application } from "express";
import chalk from "chalk";
import { Route } from "../../Interfaces";
import RouterInstance from "../Router";
import { Server as HttpServer } from "http";
import { ServerRun } from "../../Interfaces";

class ServerRunner implements ServerRun {
    private port: string;
    private application: null | Application = null;

    constructor(port: string) {
        this.port = port;
    }

    public getApp(): Application {
        return <Application>this.application;
    }

    public setApp(express: Application) {
        if (this.application === null) this.application = express;
    }

    public start(): void {
        this.setApp(express());
        this.getApp().disabled("x-powerd-by");

        this.getApp().set("port", this.port);

        const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

        const server: HttpServer = this.getApp().listen(this.port, (): void => {
            console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green("started")}`);
            console.log(`Server or worker listen on ${chalk.blue.bold(this.port)}.`);
        });

        const rest = instanceRouter.initInstance("/rest");
        const dogs = instanceRouter.createRoute("/dogs");

        rest.get("/", (req: Request, res: Response) => {
            console.log(`${chalk.red("Requset url:")} ${chalk.blue(req.baseUrl)}`);
            res.type("application/json");
            res.json({ content: "HI!" });
        });

        dogs.get("/", (req: Request, res: Response) => {
            console.log(`${chalk.red("Requset url:")} ${chalk.blue(req.baseUrl)}`);
            res.type("application/json");
            res.json({ content: "DOGS!" });
        });

        if (process.env.NODE_ENV === "production") {
            this.getApp().use(express.static(process.cwd() + "/client/build"));
            this.getApp().get("*", (req: Request, res: Response) => {
                res.sendFile(process.cwd() + "/client/build/index.html");
            });
        }

        process.on("SIGTERM", (): void => {
            server.close();
        });
    }
}

export default ServerRunner;
