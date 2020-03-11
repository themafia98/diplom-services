import cluster, { Worker } from "cluster";
import { Server as WebSocketServer, Socket } from "socket.io";
import { WorkerDataProps, WsWorker } from "../../Utils/Interfaces";
import chalk from "chalk";

class ProcessRouter {
    private workers: Array<Worker> = [];
    private wsWorker: WsWorker;

    constructor(workers: Array<Worker>, wsWorker: WsWorker) {
        this.workers = workers;
        this.wsWorker = wsWorker;
    }

    getWsWorker(): WsWorker {
        return this.wsWorker;
    }

    getWorkers(): Array<Worker> {
        return this.workers;
    }

    addWorker(worker: Worker): void {
        this.workers.push(worker);
    }

    removeWorker(workerId: number): void {
        const index = this.getWorkers().findIndex(worker => worker.id === workerId);
        this.getWorkers().splice(index, 1);
    }

    onExit(worker: Worker, code: number, signal: string): void {
        console.log(`${chalk.yellow("worker")} ${chalk.red(worker.process.pid)} exit.`);

        this.removeWorker(worker.id);

        const child: Worker = cluster.fork();
        this.subscribe(child);
        this.addWorker(child);

        console.log(`New ${chalk.yellow("worker")} ${chalk.red(child.process.pid)} born.`);
    }

    router(workerData: any): void {
        for (let worker of this.getWorkers().values()) {
            worker.send(workerData);
        }
    }

    subscribe(worker: Worker): void {
        worker.on("exit", this.onExit.bind(this));
        worker.on("message", this.router.bind(this));
    }
}

export default ProcessRouter;
