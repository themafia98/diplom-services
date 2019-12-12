"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const Utils_1 = __importDefault(require("../../Utils"));
var Logger;
(function (Logger) {
    Logger.factory = (level, format, defaultMeta) => {
        return winston_1.default.createLogger({
            level,
            format,
            defaultMeta,
            transports: Utils_1.default.getLoggerTransports(level)
        });
    };
})(Logger || (Logger = {}));
exports.default = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL0xvZ2dlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUEwQztBQUMxQyx3REFBZ0M7QUFFaEMsSUFBVSxNQUFNLENBU2Y7QUFURCxXQUFVLE1BQU07SUFDQyxjQUFPLEdBQUcsQ0FBQyxLQUFhLEVBQUUsTUFBVyxFQUFFLFdBQW1CLEVBQVUsRUFBRTtRQUMvRSxPQUFPLGlCQUFPLENBQUMsWUFBWSxDQUFDO1lBQ3hCLEtBQUs7WUFDTCxNQUFNO1lBQ04sV0FBVztZQUNYLFVBQVUsRUFBRSxlQUFLLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1NBQy9DLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztBQUNOLENBQUMsRUFUUyxNQUFNLEtBQU4sTUFBTSxRQVNmO0FBRUQsa0JBQWUsTUFBTSxDQUFDIn0=