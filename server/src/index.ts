import cluster from "cluster";
import os from "os";

import Server from "./Models/Server";

namespace Entrypoint {
    const cpuLentgh: number = os.cpus().length;

    if (cluster.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster.fork();
        }
    } else {
        const app = new Server("3001");
        app.start();
    }
}

export default Entrypoint;
