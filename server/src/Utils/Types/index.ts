import winston from "winston";

export type collectionOperations = {
    get: Function;
    put: Function;
    delete: Function;
    update: Function;
    start: Function;
};
export type FileTransportInstance = winston.transports.FileTransportInstance;
