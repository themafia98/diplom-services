import winston from "winston";
import { files } from 'dropbox';
import { DocumentQuery, Document } from "mongoose";
import { Response } from "express";

export type collectionOperations = {
    get: Function;
    set: Function;
    delete: Function;
    update: Function;
    start: Function;
};

export type actionGet = {
    collection: string;
    param: Object;
};

export type ListFolderResult = files.ListFolderResult | null;
export type FileMetadata = files.FileMetadata | null;
export type DeleteFile = files.DeleteResult;


export type paramAction = {
    from?: string;
    method?: string;
    updateField?: object | undefined;
    id?: object | undefined;
    metadataSearch?: object;
    body?: object;
    methodQuery?: string;
};

export type schemaConfig = {
    name: string;
    schemaType: string;
};
export type BuilderResponse = Promise<DocumentQuery<any, Document> | object | null>;

export type ResRequest = Promise<Response | void>;

export type Decorator = <Function extends ClassDecorator>(target: object, propKey?: string) => void;

export type FileTransportInstance = winston.transports.FileTransportInstance;

export type docResponse = string | number | object | null | Array<any> | any;

export type ActionData = Promise<Array<Document>> | null | Document | Promise<Document>;

export type ParserData = Promise<Document | Document[] | null | files.FileMetadata | files.ListFolderResult | files.DeleteResult>;

export type ParserResult = Document | Document[] | null | files.FileMetadata | files.ListFolderResult | BinaryType | files.DeleteResult;
