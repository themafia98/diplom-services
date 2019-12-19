import winston from "winston";
import { Model } from 'mongoose';
declare namespace Utils {
    const getLoggerTransports: (level: string) => winston.transports.FileTransportInstance | winston.transports.FileTransportInstance[];
    const getModelByName: (name: string, schemaType: string) => Model<any, any>;
    const responseTime: (start: Date) => number;
}
export default Utils;
