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
        try {
            const schema = Schema_1.getSchemaByName(schemaType);
            if (mongoose_1.Schema)
                return mongoose_1.model(name, schema);
            else
                return null;
        }
        catch (err) {
            console.log(err);
            return null;
        }
    };
    Utils.responseTime = (start) => {
        return new Date() - start;
    };
})(Utils || (Utils = {}));
exports.default = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBOEI7QUFDOUIsdUNBQWdEO0FBQ2hELHNEQUE0RDtBQUc1RCxJQUFVLEtBQUssQ0FxQmQ7QUFyQkQsV0FBVSxLQUFLO0lBQ0UseUJBQW1CLEdBQUcsQ0FBQyxLQUFhLEVBQXdELEVBQUU7UUFDdkcsSUFBSSxLQUFLLEtBQUssTUFBTSxFQUFFO1lBQ2xCLE9BQU8sQ0FBQyxJQUFJLGlCQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNqRjs7WUFBTSxPQUFPLElBQUksaUJBQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN6RixDQUFDLENBQUM7SUFFVyxvQkFBYyxHQUFHLENBQUMsSUFBWSxFQUFFLFVBQWtCLEVBQTBCLEVBQUU7UUFDdkYsSUFBSTtZQUNBLE1BQU0sTUFBTSxHQUFrQix3QkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFELElBQUksaUJBQU07Z0JBQUUsT0FBTyxnQkFBSyxDQUFDLElBQUksRUFBVSxNQUFNLENBQUMsQ0FBQzs7Z0JBQzFDLE9BQU8sSUFBSSxDQUFDO1NBQ3BCO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDLENBQUE7SUFFWSxrQkFBWSxHQUFHLENBQUMsS0FBVyxFQUFFLEVBQUU7UUFDeEMsT0FBWSxJQUFJLElBQUksRUFBRSxHQUFRLEtBQUssQ0FBQztJQUN4QyxDQUFDLENBQUE7QUFDTCxDQUFDLEVBckJTLEtBQUssS0FBTCxLQUFLLFFBcUJkO0FBRUQsa0JBQWUsS0FBSyxDQUFDIn0=