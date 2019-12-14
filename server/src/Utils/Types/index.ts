import winston from "./node_modules/winston";

export type collectionOperations = {
    get: Function;
    post: Function;
    put: Function;
    delete: Function;
    update: Function;
    start: Function;
};

export type actionGet = {
    collection: string;
    param: Object;
};

export type paramAction = {
    metadataSearch?: Object,
    methodQuery?: string,
}

export type schemaConfig = {
    name: string,
    schemaType: string,
}

export type FileTransportInstance = winston.transports.FileTransportInstance;
