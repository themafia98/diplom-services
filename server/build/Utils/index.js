"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const mongoose_1 = require("mongoose");
const Schema_1 = require("../Models/Database/Schema");
var Utils;
(function (Utils) {
    Utils.getLoggerTransports = (level) => {
        if (level === "info") {
            return [new winston_1.default.transports.File({ filename: "info.log", level: "info" })];
        }
        else
            return new winston_1.default.transports.File({ filename: "error.log", level: "error" });
    };
    Utils.getModelByName = (name, schemaType) => {
        const schema = Schema_1.getSchemaByName(schemaType);
        if (mongoose_1.Schema)
            return mongoose_1.model(name, schema);
        else
            return null;
    };
})(Utils || (Utils = {}));
exports.default = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBOEI7QUFDOUIsdUNBQWdEO0FBQ2hELHNEQUE0RDtBQUc1RCxJQUFVLEtBQUssQ0FZZDtBQVpELFdBQVUsS0FBSztJQUNFLHlCQUFtQixHQUFHLENBQUMsS0FBYSxFQUF3RCxFQUFFO1FBQ3ZHLElBQUksS0FBSyxLQUFLLE1BQU0sRUFBRTtZQUNsQixPQUFPLENBQUMsSUFBSSxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDakY7O1lBQU0sT0FBTyxJQUFJLGlCQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDekYsQ0FBQyxDQUFDO0lBRVcsb0JBQWMsR0FBRyxDQUFDLElBQVksRUFBRSxVQUFrQixFQUEwQixFQUFFO1FBQ3ZGLE1BQU0sTUFBTSxHQUFrQix3QkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFELElBQUksaUJBQU07WUFBRSxPQUFPLGdCQUFLLENBQUMsSUFBSSxFQUFVLE1BQU0sQ0FBQyxDQUFDOztZQUMxQyxPQUFPLElBQUksQ0FBQztJQUNyQixDQUFDLENBQUE7QUFDTCxDQUFDLEVBWlMsS0FBSyxLQUFMLEtBQUssUUFZZDtBQUVELGtCQUFlLEtBQUssQ0FBQyJ9