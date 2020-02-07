import socketio, { Socket, EngineSocket } from 'socket.io';
import { App } from '../../Utils/Interfaces';
import cluster from 'cluster';
import { Application } from 'express';

class WebSocketWorker {

    private workers: Array<socketio.Server> = [];
    private workerId = cluster.worker.id;

    constructor(wsWorkers: Array<socketio.Server>) {
        this.workers = wsWorkers;
    }

    public startSocketConnection(io: socketio.Server) {
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

    public eventStart(): void {

        const workerId: number = this.getWorkerId();

        this.getWorker(workerId).on('connection', (socket: Socket) => {
            console.log("ws connection");
            socket.emit("connection", true);

            socket.on("newMessage", (msg, tokenRoom) => {
                this.getWorker(workerId).to(tokenRoom).emit("msg", msg);
            });

            socket.on("onChatRoomActive", ({ token: tokenRoom, displayName = "" }) => {
                socket.join(tokenRoom);
                this.getWorker(workerId).to(tokenRoom).emit("joinMsg", {
                    tokenRoom,
                    displayName: "System",
                });
            });

        });

        this.getWorker(this.workerId).on('disconnect', (socket: Socket) => {
            console.log(socket.eventNames);
            console.log('user disconnected');
        });
    }
}

export default WebSocketWorker;