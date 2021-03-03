import cluster, { Worker } from 'cluster';
import 'reflect-metadata';
import fs from 'fs';
import os from 'os';

import { ServerRun } from './utils/Interfaces/Interfaces.global';
import Logger from './utils/Logger';
import Utils from './utils/utils.global';
import ProcessRouter from './models/Process/ProcessRouter';
import Http from './models/Server';
import Instanse from './utils/instanse';

if (Utils.isProd()) {
  fs.openSync('/tmp/app-initialized', 'w');
}

namespace Entrypoint {
  const { loggerError, loggerInfo } = Logger;
  const cpuLentgh: number = os.cpus().length;
  const workers: Array<Worker> = [];

  const workersRouter = new ProcessRouter(workers, Instanse.ws);

  if (cluster.isMaster) {
    for (let i = 0; i < cpuLentgh; i++) {
      const worker: Worker = cluster.fork();
      workersRouter.subscribe(worker);
      workersRouter.addWorker(worker);
    }

    loggerInfo('Server and workers to born');
  } else {
    try {
      const app: ServerRun = new Http.ServerRunner(process.env.APP_PORT || '3001');
      app.start();
    } catch (err) {
      loggerError(
        `Server shut down. PPID: ${process.ppid} || ${err}. Node: ${process.versions.node}. v8: ${process.versions.v8}`,
      );
      console.error('Server shut down');

      process.exit(1);
    }
  }
}

export default Entrypoint;
