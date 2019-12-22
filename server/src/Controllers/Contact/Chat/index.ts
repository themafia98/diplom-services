import express, { Router as RouteExpress } from 'express';
import redis from 'socket.io-redis';
import socketio from 'socket.io';
import { App } from '../../../Utils/Interfaces';
namespace Chat {
    export const module = (app: App, server: any): null | void => {
        if (!app) return null;
        const ws = socketio(server);
        ws.adapter(redis({
            url: process.env.REDISCLOUD_URL
        }));
        ws.of("/").on("error", () => {
            console.log("err");
        });

        ws.on('connection', function (socket) {
            console.log("ws connection");
            socket.emit("message", `hello ws connection!,${Date.now()}`)
        });

        ws.on('disconnect', function () {
            console.log('user disconnected');

        });
    }
}

export default Chat;