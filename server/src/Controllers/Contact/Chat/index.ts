import cluster from 'cluster';
import socketio from 'socket.io';
import { App } from '../../../Utils/Interfaces';
import Entrypoint from '../../../';
namespace Chat {
    export const module = (app: App, server: any): null | void => {
        if (!app) return null;
        const { wsWorkers = [] } = Entrypoint || {};
        const workerId = cluster.worker.id;
        wsWorkers[workerId] = socketio(server);

        wsWorkers[workerId].on('connection', socket => {
            console.log("ws connection");
            socket.on("newMessage", msg => {
                wsWorkers[workerId].emit("message", msg);
            });
        });

        wsWorkers[workerId].on('disconnect', () => {
            console.log('user disconnected');

        });
    }
}

export default Chat;