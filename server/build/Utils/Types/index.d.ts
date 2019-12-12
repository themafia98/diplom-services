import winston from "winston";
export declare type collectionOperations = {
    get: Function;
    post: Function;
    put: Function;
    delete: Function;
    update: Function;
    start: Function;
};
export declare type actionGet = {
    collection: string;
    param: Object;
};
export declare type FileTransportInstance = winston.transports.FileTransportInstance;
