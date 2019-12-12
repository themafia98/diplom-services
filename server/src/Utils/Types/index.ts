import winston from "winston";

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
    metadataSearch?: Object
}
export type FileTransportInstance = winston.transports.FileTransportInstance;
