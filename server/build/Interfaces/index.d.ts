import { Application, Router as RouteExpress } from "express";
export interface ServerRun {
    setApp(express: Application): void;
    getApp(): Application;
    start(): void;
}
export interface Route {
    init: boolean;
    getRest(): Application;
    getEntrypoint(): Application;
    initInstance(path: string): Application;
    createRoute(path: string, flag?: string): RouteExpress;
}
