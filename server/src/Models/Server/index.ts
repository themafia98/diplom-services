import express, { Request, Response, Application } from "express";
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

    getApp(): Application {
        return <Application>this.application;
    }

    setApp(express: Application) {
        if (this.application === null) this.application = express;
    }

    start(): void {
        this.application = express();
        this.application.disabled("x-powerd-by");

        this.application.set("port", this.port);

        const instanceRouter: Route = RouterInstance.Router.instance(this.application);

        const server: HttpServer = this.application.listen(this.port, (): void => {
            console.log(`Worker ${process.pid} started`);
            console.log(`Server or worker listen on ${this.port}.`);
        });

        const rest = instanceRouter.initInstance("/rest");
        const dogs = instanceRouter.createRoute("/dogs");

        rest.get("/test", (req: Request, res: Response) => {
            res.type("application/json");
            res.json({ content: "HI!" });
        });

        dogs.get("/", (req: Request, res: Response) => {
            res.type("application/json");
            res.json({ content: "DOGS!" });
        });

        if (process.env.NODE_ENV === "production") {
            this.application.use(express.static(process.cwd() + "/client/build"));
            this.application.get("*", (req: Request, res: Response) => {
                res.sendFile(process.cwd() + "/client/build/index.html");
            });
        }

        process.on("SIGTERM", (): void => {
            server.close();
        });
    }
}

export default ServerRunner;
