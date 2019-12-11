import winston from "winston";
import * as Transport from "winston-transport";
import { Format } from "logForm";

namespace Utils {
    export const getLoggerTransports = (level: string): Transport[] | Transport => {
        if (level === "info") {
            return [new winston.transports.File({ filename: "info.log", level: "info" })];
        } else return new winston.transports.File({ filename: "error.log", level: "error" });
    };
}

export default Utils;
