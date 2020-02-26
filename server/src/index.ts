import cluster, { Worker } from "cluster";
import farmhash from "farmhash";
import "reflect-metadata";
import { Server as WebSocketServer } from "socket.io";
import chalk from "chalk";
import fs from "fs";
import os from "os";

import _ from "lodash";

import { ServerRun } from "./Utils/Interfaces";
import Http from "./Models/Server";

if (process.env.NODE_ENV === "production") {
    /** nginx init */
    fs.openSync("/tmp/app-initialized", "w");
}

namespace Entrypoint {
    const cpuLentgh: number = os.cpus().length;
    export const wsWorkers: Array<WebSocketServer> = [];

    const getWorker_index = (ip: string, len: number) => {
        return farmhash.fingerprint32(ip) % len;
    };

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

        // get worker index based on Ip and total no of workers so that it can be tranferred to same worker
    } else {
        try {
            const app: ServerRun = new Http.ServerRunner(process.env.APP_PORT || "3001");
            app.start(getWorker_index);
        } catch (err) {
            console.error(err);
            process.kill(process.ppid);
        }
    }
}

export default Entrypoint;
