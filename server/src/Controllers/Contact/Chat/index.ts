import express, { Router as RouteExpress } from 'express';
import socketio from 'socket.io';
import { App } from '../../../Utils/Interfaces';
namespace Chat {
    export const module = (app: App, server: any): null | void => {
        if (!app) return null;
        const ws = socketio(server);
        (<any>ws).set("store", app.locals.redis);
        ws.on('connection', function (socket) {
            console.log('a user connected');
            setInterval(() => {
                ws.emit("wsTest", "hi ws!!!");
            }, 3000);
        });

        ws.on('disconnect', function () {
            console.log('user disconnected');
        });
    }
}

export default Chat;