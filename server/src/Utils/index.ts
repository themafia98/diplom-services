import winston from "winston";

namespace Utils {
    export const getLoggerTransports = (level: string): Array<Object> | Object => {
        if (level === "info") {
            return [new winston.transports.File({ filename: "info.log", level: "info" })];
        } else return new winston.transports.File({ filename: "error.log", level: "error" });
    };
}

export default Utils;
