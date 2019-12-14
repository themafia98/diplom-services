import express, { Router as RouteExpress } from 'express';
import socket from 'socket.io';
import { App } from '../../../Utils/Interfaces';
namespace Chat {
    export const module = (app: App, socket: any): null | void => {
        if (!app) return null;

    }
}

export default Chat;