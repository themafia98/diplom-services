import cluster, { Worker } from 'cluster';
import { Server as HttpServer } from 'http';
import { WsWorker, Dbms } from '../../Utils/Interfaces/Interfaces.global';
import chalk from 'chalk';
import { Socket } from 'net';

class ProcessRouter {
  private readonly workers: Array<Worker> = [];
  private readonly wsWorker: WsWorker;

  constructor(workers: Array<Worker>, wsWorker: WsWorker) {
    this.workers = workers;
    this.wsWorker = wsWorker;
  }

  static errorEventsRegister(server: HttpServer, dbm: Dbms): void {
    server.on('clientError', (err: Error, socket: Socket) => {
      console.error(err);
      console.log(err.stack);
      socket.destroy();
    });

    process.on('SIGTERM', (): void => {
      console.log('SIGTERM, uptime:', process.uptime());
      server.close();
    });

    process.on('uncaughtException', (err: Error) => {
      // handle the error safely
      if (err.name === 'MongoNetworkError') {
        dbm.disconnect().catch((err: Error) => console.error(err));
        console.log('uncaughtException. uptime:', process.uptime());
        console.error(err);
      } else {
        console.error(err);
        console.log('exit error, uptime:', process.uptime());
        process.exit(1);
      }
    });
  }

  private handleWorkerError(err: Error) {
    console.error('Worker handle error');
    console.error(err);
  }

  public getWsWorker(): WsWorker {
    return this.wsWorker;
  }

  public getWorkers(): Array<Worker> {
    return this.workers;
  }

  public addWorker(worker: Worker): void {
    this.workers.push(worker);
  }

  public removeWorker(workerId: number): void {
    const index: number = this.getWorkers().findIndex((worker) => worker.id === workerId);
    this.getWorkers().splice(index !== -1 ? index : 0, 1);
  }

  public onExit(worker: Worker): void {
    if (!worker || (worker && !worker.process)) {
      console.error(worker);
      throw new Error('worker not found for exit');
    }

    const { pid = '' } = worker.process;

    console.log(`${chalk.yellow('worker')} ${chalk.red(pid || '')} exit.`);

    this.removeWorker(worker.id);

    const child: Worker = cluster.fork();
    const { pid: pidChild = '' } = child.process;

    this.subscribe(child);
    this.addWorker(child);

    console.log(`New ${chalk.yellow('worker')} ${chalk.red(pidChild || '')} born.`);
  }

  public router(workerData: object): void {
    for (let worker of this.getWorkers().values()) {
      worker.send(workerData);
    }
  }

  public subscribe(worker: Worker): void {
    worker.on('exit', this.onExit.bind(this));
    worker.on('message', this.router.bind(this));
    worker.on('error', this.handleWorkerError);
  }
}

export default ProcessRouter;
