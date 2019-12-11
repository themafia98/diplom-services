import winston, { Logger } from "winston";
import { Format } from "logForm";

import Utils from "../../Utils";

namespace Logger {
    export const factory = (
        level: string,
        format: Format = winston.format.json(),
        defaultMeta: any = { service: "service" }
    ): Logger => {
        return winston.createLogger({
            level,
            format,
            defaultMeta,
            transports: Utils.getLoggerTransports(level)
        });
    };
}

export default Logger;
