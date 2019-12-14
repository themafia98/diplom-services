import winston from "winston";
import { model, Schema, Model } from 'mongoose';
import { getSchemaByName } from '../Models/Database/Schema';
import { FileTransportInstance, schemaConfig } from "./Types";

namespace Utils {
    export const getLoggerTransports = (level: string): Array<FileTransportInstance> | FileTransportInstance => {
        if (level === "info") {
            return [new winston.transports.File({ filename: "info.log", level: "info" })];
        } else return new winston.transports.File({ filename: "error.log", level: "error" });
    };

    export const getModelByName = (name: string, schemaType: string): Model<any, any> | null => {
        const schema: Schema | null = getSchemaByName(schemaType);
        if (Schema) return model(name, <Schema>schema);
        else return null;
    }
}

export default Utils;
