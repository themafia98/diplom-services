import { Application, Router as RouteExpress, Request as RequestExpress, Response, NextFunction } from "express";
import { collectionOperations } from "../Types";
import { Mongoose } from "mongoose";

export interface ServerRun {
    isPrivateRoute(req: Request, res: Response, next: NextFunction): Response | void;
    startResponse(req: Request, res: Response, next: NextFunction): void;
    getApp(): Application;
    getRest(): Application;
    setRest(route: Application): void;
    setApp(express: Application): void;
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
    start?: Date;
    body: BodyLogin;
    session?: any;
    isAuthenticated(): boolean;
}

export interface BodyLogin {
    email?: string;
    password?: string;
}

export interface RouteDefinition {
    path: string;
    requestMethod: "get" | "post" | "delete" | "options" | "put";
    methodName: string;
    private?: boolean;
}

export interface DecoratorConfig extends Object {
    path: string;
    private: boolean;
}

export interface methodParam extends Object {
    metadata: Array<any>;
}

export interface Metadata extends Object {
    /** Mongo db data object */
    GET: methodParam;
}

export interface User extends Object {
    _id: string;
    email: string;
    displayName: string;
    departament: string;
    position: string;
    rules: string;
    accept: boolean;
}

export interface MetadataMongo extends Metadata {
    _doc?: Array<object>;
    [key: string]: MetadataMongo | any;
}

export interface MetadataConfig {
    methodQuery: string;
    body?: object;
}

export interface BuilderData extends ResponseMetadata {
    err: object | null,
    data: object | null,
    param: object | null,
}

export interface Builder {
    collection?: string;
    exit?: boolean;
    exitData?: object;
    param?: ResponseMetadata;
}
