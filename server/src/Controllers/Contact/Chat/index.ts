import cluster from 'cluster';
import socketio, { Socket } from 'socket.io';
import { App } from '../../../Utils/Interfaces';
import Entrypoint from '../../../';
namespace Chat {
    export const module = (app: App, server: any): null | void => {
        if (!app) return null;
        const { wsWorkers = [] } = Entrypoint || {};
        const workerId = cluster.worker.id;
        wsWorkers[workerId] = socketio(server);

        wsWorkers[workerId].on('connection', (socket: Socket) => {
            console.log("ws connection");
            socket.emit("connection", true);

            socket.on("newMessage", msg => {
                wsWorkers[workerId].emit("message", msg);
            });

        });

        wsWorkers[workerId].on('disconnect', (socket: Socket) => {
            console.log(socket.eventNames);
            console.log('user disconnected');
        });
    }
}

export default Chat;