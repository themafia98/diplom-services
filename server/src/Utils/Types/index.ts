import winston from "winston";

export type collectionOperations = {
    get: Function;
    put: Function;
    delete: Function;
    update: Function;
};
export type FileTransportInstance = winston.transports.FileTransportInstance;
