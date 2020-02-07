import socketio, { Socket, EngineSocket } from 'socket.io';
import { WsWorker } from '../../Utils/Interfaces';
import cluster from 'cluster';
import { Application } from 'express';

class WebSocketWorker implements WsWorker {

    private workers: Array<socketio.Server> = [];
    private workerId = cluster.worker.id;

    constructor(wsWorkers: Array<socketio.Server>) {
        this.workers = wsWorkers;
    }

    public startSocketConnection(io: socketio.Server): void {
        this.workers[this.workerId] = io;
    }

    public getWorkerId(): number {
        return this.workerId;
    }

    public getWorker(id: number): socketio.Server {
        return this.workers[id];
    }

    public getWorkersArray(): Array<socketio.Server> {
        return this.workers;
    }
}

export default WebSocketWorker;