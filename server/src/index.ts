import cluster from "cluster";
import os from "os";
import { ServerRun } from "./Interfaces";
import ServerRunner from "./Models/Server";

namespace Entrypoint {
    const cpuLentgh: number = os.cpus().length;

    if (cluster.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster.fork();
        }
    } else {
        const server: ServerRun = new ServerRunner(process.env.PORT || "3001");
        server.start();
    }
}

export default Entrypoint;
