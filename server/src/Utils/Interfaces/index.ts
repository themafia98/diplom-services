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

export interface Dbms {
    getConnect(): string;
    getData(config: Object): Object;
    putData(config: Object): boolean;
    deleteData(config: Object): boolean;
    updateData(config: Object): boolean;
}

export interface CryptoSecurity {}
