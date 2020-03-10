import cluster, { Worker } from "cluster";
import { WorkerDataProps } from "../../Utils/Interfaces";
import chalk from "chalk";

class ProcessRouter {
    constructor(private workers: Array<Worker> = []) {}

    getWorkers(): Array<Worker> {
        return this.workers;
    }

    addWorker(worker: Worker) {
        this.workers.push(worker);
    }

    removeWorker(workerId: number) {
        const index = this.getWorkers().findIndex(worker => worker.id === workerId);
        this.getWorkers().splice(index, 1);
    }

    onExit(worker: Worker, code: number, signal: string) {
        console.log(`${chalk.yellow("worker")} ${chalk.red(worker.process.pid)} exit.`);

        this.removeWorker(worker.id);

        const child: Worker = cluster.fork();
        this.addWorker(child);

        console.log(`New ${chalk.yellow("worker")} ${chalk.red(child.process.pid)} born.`);
    }

    router(workerData: WorkerDataProps) {
        for (let worker of this.getWorkers().values()) {
            worker.send(workerData);
        }
    }

    subscribe(worker: Worker) {
        worker.on("exit", this.onExit);
        worker.on("message", this.router);
    }
}

export default ProcessRouter;
