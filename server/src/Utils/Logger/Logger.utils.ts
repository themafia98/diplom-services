import winston, { Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getLoggerTransports } from '../utils.global';
import path from 'path';

export const factory = (
  level: string | Array<string>,
  defaultMeta: Object = { service: 'user-service' },
  includeDailyLogs: boolean = false,
  onlyDaily: boolean = true,
): Logger => {
  const transport: Array<any> = !onlyDaily && includeDailyLogs ? getLoggerTransports(level) : [];
  const daily: Array<DailyRotateFile | void> =
    includeDailyLogs || (<any>process).NODE_ENV === 'production'
      ? [
          new DailyRotateFile({
            filename: `logs-${level}-%DATE%.log`,
            datePattern: 'YYYY-MM-DD-HH',
            dirname: path.normalize('logs'),
            zippedArchive: true,
            maxSize: '20m',
            auditFile: `logger.${level}-audit.json`,
            maxFiles: '1d',
          }),
        ]
      : [];

  const logger = winston.createLogger({
    defaultMeta,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint(),
      winston.format.colorize(),
      winston.format.json(),
    ),
    transports: [...transport, ...daily],
  });

  return logger;
};
