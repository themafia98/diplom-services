import winston from "winston";
import { FileTransportInstance } from "../Utils/Types";

namespace Utils {
    export const getLoggerTransports = (level: string): Array<FileTransportInstance> | FileTransportInstance => {
        if (level === "info") {
            return [new winston.transports.File({ filename: "info.log", level: "info" })];
        } else return new winston.transports.File({ filename: "error.log", level: "error" });
    };
}

export default Utils;
