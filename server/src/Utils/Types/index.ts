import winston from "winston";
import { Response } from "express";

export type collectionOperations = {
    get: Function;
    post: Function;
    set: Function;
    delete: Function;
    update: Function;
    start: Function;
};

export type actionGet = {
    collection: string;
    param: Object;
};

export type paramAction = {
    metadataSearch?: object;
    body?: object;
    methodQuery?: string;
};

export type schemaConfig = {
    name: string;
    schemaType: string;
};

export type ResRequest = Promise<Response | void>;

export type Decorator = <Function extends ClassDecorator>(target: object, propKey?: string) => void;

export type FileTransportInstance = winston.transports.FileTransportInstance;
