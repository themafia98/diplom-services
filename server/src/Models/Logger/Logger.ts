import winston, { Logger } from 'winston';
import Utils from '../../Utils';

namespace Logger {
  export const factory = (level: string, format: any, defaultMeta: Object): Logger => {
    return winston.createLogger({
      level,
      format,
      defaultMeta,
      transports: Utils.getLoggerTransports(level),
    });
  };
}

export default Logger;