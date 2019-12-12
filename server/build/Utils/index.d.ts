import winston from "winston";
declare namespace Utils {
    const getLoggerTransports: (level: string) => winston.transports.FileTransportInstance | winston.transports.FileTransportInstance[];
}
export default Utils;
