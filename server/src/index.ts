import cluster, { Worker } from "cluster";
import fs from "fs";
import os from "os";
import { ServerRun } from "./Utils/Interfaces";
import ServerRunner from "./Models/Server";

if (process.env.NODE_ENV === "production") {
    /** nginx init */
    fs.openSync("/tmp/app-initialized", "w");
}

namespace Entrypoint {
    const cpuLentgh: number = os.cpus().length;

    if (cluster.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster.fork();

            cluster.on("exit", (worker: Worker, code: number, signal: string) => {
                console.log(`worker ${worker.process.pid} exit.`);

                const child = cluster.fork();
                console.log(`New worker ${child.process.pid} born.`);
            });
        }
    } else {
        try {
            const server: ServerRun = new ServerRunner(process.env.APP_PORT || "3001");
            server.start();
        } catch (err) {
            console.log(err);
        }
    }
}

export default Entrypoint;
