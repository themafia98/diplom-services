import cluster, { Worker } from 'cluster';
import 'reflect-metadata';
import fs from 'fs';
import os, { CpuInfo } from 'os';
import ProcessRouter from './Models/Process/ProcessRouter';
import Instanse from './Utils/instanse';
import { getVersion, isProd } from './Utils/utils.global';
import startApplication from './start';
import { loggerInfo } from './Utils/Logger/Logger';

if (isProd()) {
  fs.openSync('/tmp/app-initialized', 'w');
}

if (!getVersion()) {
  throw new Error('Api version not found');
}

const cpus: CpuInfo[] = os.cpus();
const workers: Array<Worker> = [];
const workersRouter = new ProcessRouter(workers, Instanse.ws);

if (cluster.isMaster) {
  cpus.forEach(() => {
    const worker: Worker = cluster.fork();
    workersRouter.subscribe(worker);
    workersRouter.addWorker(worker);
  });

  loggerInfo('Server and workers to born');
} else {
  startApplication();
}
