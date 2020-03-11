import cluster, { Worker } from "cluster";
import "reflect-metadata";
import { Server as WebSocketServer } from "socket.io";
import chalk from "chalk";
import fs from "fs";
import os from "os";

import _ from "lodash";

import { ServerRun } from "./Utils/Interfaces";
import WebSocketWorker from "./Models/WebSocketWorker";
import ProcessRouter from "./Models/Process/ProcessRouter";
import Http from "./Models/Server";

if (process.env.NODE_ENV === "production") {
    /** nginx init */
    fs.openSync("/tmp/app-initialized", "w");
}

export const wsWorkerManager: WebSocketWorker = new WebSocketWorker();

namespace Entrypoint {
    const cpuLentgh: number = os.cpus().length;
    const workers: Array<Worker> = [];

    const workersRouter = new ProcessRouter(workers, wsWorkerManager);

    if (cluster.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            const worker: Worker = cluster.fork();
            workersRouter.subscribe(worker);
            workersRouter.addWorker(worker);
        }
    } else {
        try {
            const app: ServerRun = new Http.ServerRunner(process.env.APP_PORT || "3001");
            app.start();
        } catch (err) {
            console.error(err);
            process.kill(process.ppid);
        }
    }
}

export default Entrypoint;
