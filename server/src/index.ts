import cluster, { Worker } from 'cluster';
import 'reflect-metadata';
import fs from 'fs';
import os from 'os';

import { ServerRun } from './Utils/Interfaces';
import Utils from './Utils';
import wsWorkerManager from './Utils/instanseWs';
import ProcessRouter from './Models/Process/ProcessRouter';
import Http from './Models/Server';

if (Utils.isProd()) {
  fs.openSync('/tmp/app-initialized', 'w');
}

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
      const app: ServerRun = new Http.ServerRunner(process.env.APP_PORT || '3001');
      app.start();
    } catch (err) {
      console.error(err);
      process.kill(process.ppid);
    }
  }
}

export default Entrypoint;
