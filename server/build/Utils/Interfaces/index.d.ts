import { Application, Router as RouteExpress } from "express";
import { collectionOperations } from "../Types";
import { Mongoose } from "mongoose";
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
    db: string;
    getConnect(): Mongoose | null;
    connection(): Promise<void | Mongoose>;
    disconnect(): Promise<null | Mongoose>;
    getResponseParams(): ResponseMetadata;
    setResponse(config: Object): Dbms;
    setResponseParams(key: string, param: Object | string): void;
    clearResponseParams(): Dbms;
    collection(name: string): collectionOperations;
}
export interface ResponseMetadata {
    [key: string]: any;
}
export interface Metadata {
}
export interface MetadataConfig {
}
export interface CryptoSecurity {
}