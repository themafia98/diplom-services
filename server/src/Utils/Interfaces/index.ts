import { Application, Router as RouteExpress } from "express";
import { collectionOperations } from "../Types";

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
    collection(name: string): collectionOperations;
}

export interface ResponseMetadata {
    [key: string]: any;
}

export interface CryptoSecurity {}
