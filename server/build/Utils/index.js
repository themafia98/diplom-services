"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
var Utils;
(function (Utils) {
    Utils.getLoggerTransports = (level) => {
        if (level === "info") {
            return [new winston_1.default.transports.File({ filename: "info.log", level: "info" })];
        }
        else
            return new winston_1.default.transports.File({ filename: "error.log", level: "error" });
    };
})(Utils || (Utils = {}));
exports.default = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBOEI7QUFHOUIsSUFBVSxLQUFLLENBTWQ7QUFORCxXQUFVLEtBQUs7SUFDRSx5QkFBbUIsR0FBRyxDQUFDLEtBQWEsRUFBd0QsRUFBRTtRQUN2RyxJQUFJLEtBQUssS0FBSyxNQUFNLEVBQUU7WUFDbEIsT0FBTyxDQUFDLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pGOztZQUFNLE9BQU8sSUFBSSxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3pGLENBQUMsQ0FBQztBQUNOLENBQUMsRUFOUyxLQUFLLEtBQUwsS0FBSyxRQU1kO0FBRUQsa0JBQWUsS0FBSyxDQUFDIn0=