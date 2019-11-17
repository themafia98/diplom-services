
import express, { Router, Request, Response } from "express";
import path from 'path';
import cluster from 'cluster';
import os from "os";
import { Server } from "http";


namespace Entrypoint {

    const cpuLentgh = os.cpus().length;

    if (cluster.isMaster) {

        for (let i = 0; i < cpuLentgh; i++) {
            cluster.fork();
        }

    } else {

        const app = express();
        app.disabled("X-Powered-By");
        app.use(express.static(process.cwd() + "/client/build"));

        const router = express.Router();

        const port: string = process.env.PORT || "3001";

        app.set("port", port);

        const server: Server = app.listen(port, () => {
            console.log(`Worker ${process.pid} started`);
            console.log(`Server or worker listen on ${port}.`);
        });

        const route: Router = app.use("/rest", router);

        route.get('*', (req, res) => {
            res.sendFile(path.join(process.cwd() + '/client/build/index.html'));
        });

        process.on("SIGTERM", () => {
            server.close();
        })
    }
}

export default Entrypoint;


