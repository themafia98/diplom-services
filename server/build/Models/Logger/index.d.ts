import winston, { Logger } from "winston";
declare namespace Logger {
    const factory: (level: string, format: any, defaultMeta: Object) => winston.Logger;
}
export default Logger;
