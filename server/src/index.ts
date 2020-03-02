import cluster, { Worker } from "cluster";
import "reflect-metadata";
import { Server as WebSocketServer } from "socket.io";
import chalk from "chalk";
import fs from "fs";
import os from "os";

import _ from "lodash";

import { ServerRun, WorkerDataProps } from "./Utils/Interfaces";
import Http from "./Models/Server";

if (process.env.NODE_ENV === "production") {
    /** nginx init */
    fs.openSync("/tmp/app-initialized", "w");
}

namespace Entrypoint {
    const cpuLentgh: number = os.cpus().length;
    const workers: Array<Worker> = [];
    export const wsWorkers: Array<WebSocketServer> = [];

    const callbackExit = _.debounce((worker: Worker, code: number, signal: string) => {
        console.log(`${chalk.yellow("worker")} ${chalk.red(worker.process.pid)} exit.`);

        const child: cluster.Worker = cluster.fork();
        console.log(`New ${chalk.yellow("worker")} ${chalk.red(child.process.pid)} born.`);
    }, 300);

    if (cluster.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            const worker: cluster.Worker = cluster.fork();
            worker.on("exit", callbackExit);

            worker.on("message", (workerData: WorkerDataProps) => {
                console.log("worker message:", workerData);

                for (let worker of workers.values()) {
                    worker.send(workerData);
                }
            });

            workers.push(worker);
        }

        // get worker index based on Ip and total no of workers so that it can be tranferred to same worker
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
