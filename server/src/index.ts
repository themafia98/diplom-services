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

        const router: Router = express.Router();

        const port: string = process.env.PORT || "3001";

        app.set("port", port);

        const server: Server = app.listen(port, (): void => {
            console.log(`Worker ${process.pid} started`);
            console.log(`Server or worker listen on ${port}.`);
        });

        const route: Router = app.use("/rest", router);

        route.get("/rest", (req: Request, res: Response) => {
            res.sendStatus(200);
        });

        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(process.cwd() + "/client/build"));
            app.get("*", (req: Request, res: Response) => {
                res.sendFile(process.cwd() + "/client/build/index.html");
            });
        }

        process.on("SIGTERM", (): void => {
            server.close();
        })
    }
}

export default Entrypoint;


