import { Application, Router as RouteExpress, Request as RequestExpress, Response, NextFunction } from "express";
import { Dropbox, files } from "dropbox";
import socketio from "socket.io";
import mongoose, { Mongoose, Connection } from "mongoose";

export interface ServerRun {
    isPrivateRoute(req: Request, res: Response, next: NextFunction): Response | void;
    startResponse(req: Request, res: Response, next: NextFunction): void;
    start(): void;
}

export interface Rest {
    getApp(): Application;
    getRest(): Application;
    setRest(route: Application): void;
    setApp(express: Application): void;
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
    getConnect(): Promise<typeof mongoose | null>;
    connection(): Promise<Connection | typeof mongoose>;
    disconnect(): Promise<null | Mongoose>;
}

export interface CryptoSecurity {
    getMode(): string;
    hashing(password: string, salt: number, callback: Function): Promise<void>;
    verify(password: string, hash: Record<string, any>, callback: Function): Promise<void>;
}

export interface App extends Application {
    locals: Record<string, any>;
    dbm: Dbms;
    hash: CryptoSecurity;
}

export interface Params {
    methodQuery: string;
    status: string;
    from: string;
    done?: boolean;
}

export interface ResponseMetadata<T> {
    param: Params;
    body: T;
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
    file?: boolean | undefined;
    ws?: boolean | undefined;
}

export interface DecoratorConfig extends Object {
    path: string;
    private: boolean;
    file?: boolean | undefined;
    ws?: boolean | undefined;
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

export interface ActionParams {
    [key: string]: number | string | Date | object;
}

export interface ResponseDocument {
    [key: string]: number | string | Date | object;
}

export interface MetadataConfig {
    methodQuery: string;
    body?: object;
}

export interface DropboxAccess {
    token: string;
}




export interface FilesManager<T> {
    getService(): T;
    changeService(service: T): void;
}

export interface FileApi {
    getAllFiles(): Promise<files.ListFolderResult | null>;
    downloadFileByProps<Props>(fileProps: Props): Promise<files.FileMetadata | null>;
    downloadFile(path: string): Promise<files.FileMetadata | null>;
    saveFile<P>(saveProps: P): Promise<files.FileMetadata | null>;
    getFilesByPath(path: string): Promise<files.ListFolderResult | null>;
    deleteFile(path: string): Promise<files.DeleteResult | null>;


}

export interface ActionProps {
    actionPath: string;
    actionType: string;
    body?: object;
    store?: FileApi;
}

export interface DownloadDropbox {
    moduleName: string;
    filename: string;
    ext: string;
    cardName?: string;
}

export interface UploadDropbox {
    path: string;
    contents: Buffer;
}

export interface EntityActionApi {
    getActionPath(): string;
    getActionType(): string;
    getStore(): FileApi;
};

export interface ResponseJson<T> {
    status: string;
    params: T;
    done: boolean;
    metadata: object | Array<any> | null | BinaryType | string;
}

export interface WsWorker {
    startSocketConnection(io: socketio.Server): void;
    getWorkerId(): number;
    getWorker(id: number): socketio.Server;
    getWorkersArray(): Array<socketio.Server>;
}
