import express, { Router, Request, Response, Express } from "express";
import path from 'path';
import cluster from 'cluster';
import os from "os";
import { Server } from "http";


namespace Entrypoint {

    const cpuLentgh: number = os.cpus().length;

    if (cluster.isMaster) {

        for (let i = 0; i < cpuLentgh; i++) {
            cluster.fork();
        }

    } else {

        const app: Express = express();
        app.disabled("X-Powered-By");
        app.use(express.static(process.cwd() + "/client/build"));

        const router: Router = express.Router();

        const port: string = process.env.PORT || "3001";

        app.set("port", port);

        const server: Server = app.listen(port, (): void => {
            console.log(`Worker ${process.pid} started`);
            console.log(`Server or worker listen on ${port}.`);
        });

        //const staticRoute: Router = app.use("/", router);
        const route: Router = app.use("/rest", router);

        route.get("/backend", (req: Request, res: Response) => {
            res.sendStatus(200);
        });

        process.on("SIGTERM", (): void => {
            server.close();
        })
    }
}

export default Entrypoint;


