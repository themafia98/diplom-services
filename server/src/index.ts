import cluster, { Worker } from 'cluster';
import 'reflect-metadata';
import fs from 'fs';
import os from 'os';

import { ServerRun } from './Utils/Interfaces';
import Logger from './Utils/Logger';
import Utils from './Utils';
import ProcessRouter from './Models/Process/ProcessRouter';
import Http from './Models/Server';
import Instanse from './Utils/instanse';

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
      loggerError(`PPID: ${process.ppid} || ${err}`);
      process.kill(process.ppid);
    }
  }
}

export default Entrypoint;
