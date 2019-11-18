import { Application, Router as RouteExpress } from "express";

export interface ServerRun {
    start(port: string): void;
}

export interface Route {
    getRest(): Application;
    initInstance(path?: string): Application;
    getEntrypoint(): Application;
    createRoute(path: string, flag?: string): RouteExpress;
}
