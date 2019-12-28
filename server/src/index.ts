import cluster, { Worker } from "cluster";
import "reflect-metadata";
import { Server as WebSocketServer } from 'socket.io';
import chalk from "chalk";
import fs from "fs";
import os from "os";

import _ from 'lodash';

import { ServerRun } from "./Utils/Interfaces";
import ServerRunner from "./Models/Server";

if (process.env.NODE_ENV === "production") {
    /** nginx init */
    fs.openSync("/tmp/app-initialized", "w");
}

namespace Entrypoint {
    const cpuLentgh: number = os.cpus().length;
    export const wsWorkers: Array<WebSocketServer> = [];


    const callbackExit = _.debounce((worker: Worker, code: number, signal: string) => {
        console.log(`${chalk.yellow("worker")} ${chalk.red(worker.process.pid)} exit.`);

        const child = cluster.fork();
        console.log(`New ${chalk.yellow("worker")} ${chalk.red(child.process.pid)} born.`);
    }, 300);

    if (cluster.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster.fork();
            cluster.on("exit", callbackExit);
        }
    } else {
        try {
            const app: ServerRun = new ServerRunner(process.env.APP_PORT || "3001");
            app.start();

        } catch (err) {
            console.error(err);
            process.kill(process.ppid);
        }
    }
}

export default Entrypoint;
