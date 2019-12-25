import { Application, Router as RouteExpress, Request as RequestExpress, Response, NextFunction } from "express";
import { collectionOperations } from "../Types";
import { Mongoose } from "mongoose";

export interface ServerRun {
    setApp(express: Application): void;
    startResponse(req: Request, res: Response, next: NextFunction): void;
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

export interface CryptoSecurity {
    getMode(): string;
    hashing(password: string, salt: number, callback: Function): Promise<void>;
    verify(password: string, hash: any, callback: Function): Promise<void>;
}

export interface App extends Application {
    dbm: Dbms;
    hash: CryptoSecurity;
}

export interface ResponseMetadata {
    [key: string]: any;
}

export interface Request extends RequestExpress {
    start?: Date,
    body: Object,
    session?: any,
    isAuthenticated(): boolean
}


export interface Metadata { }
export interface MetadataConfig { }
