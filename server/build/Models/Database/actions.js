"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const lodash_1 = __importDefault(require("lodash"));
var DatabaseActions;
(function (DatabaseActions) {
    const Schema = mongoose_1.default.Schema;
    DatabaseActions.routeDatabaseActions = async (operation) => {
        const GET = ({ collection = "", param = {} }) => {
            const scheme = new Schema({ test: String }, { versionKey: false });
            const allModel = mongoose_1.default.model(collection, scheme);
            allModel.find({}, function (err, docs) {
                if (err)
                    return console.log(err);
                console.log(docs);
            });
        };
        if (!lodash_1.default.isObject(operation) && !operation.method)
            return;
        switch (operation.method) {
            case "GET": {
                GET(operation);
                break;
            }
            case "PUT": {
                break;
            }
            case "DELETE": {
                break;
            }
            case "UPDATE": {
                break;
            }
        }
    };
})(DatabaseActions || (DatabaseActions = {}));
exports.default = DatabaseActions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvRGF0YWJhc2UvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHdEQUFnQztBQUNoQyxvREFBdUI7QUFFdkIsSUFBVSxlQUFlLENBb0N4QjtBQXBDRCxXQUFVLGVBQWU7SUFDckIsTUFBTSxNQUFNLEdBQUcsa0JBQVEsQ0FBQyxNQUFNLENBQUM7SUFFbEIsb0NBQW9CLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsRUFBRTtRQUM1RCxNQUFNLEdBQUcsR0FBRyxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sUUFBUSxHQUFHLGtCQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVwRCxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxVQUFTLEdBQUcsRUFBRSxJQUFJO2dCQUNoQyxJQUFJLEdBQUc7b0JBQUUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVqQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLGdCQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQU8sU0FBVSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBRS9ELFFBQWMsU0FBVSxDQUFDLE1BQU0sRUFBRTtZQUM3QixLQUFLLEtBQUssQ0FBQyxDQUFDO2dCQUNSLEdBQUcsQ0FBWSxTQUFTLENBQUMsQ0FBQztnQkFDMUIsTUFBTTthQUNUO1lBRUQsS0FBSyxLQUFLLENBQUMsQ0FBQztnQkFDUixNQUFNO2FBQ1Q7WUFFRCxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUNYLE1BQU07YUFDVDtZQUVELEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ1gsTUFBTTthQUNUO1NBQ0o7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDLEVBcENTLGVBQWUsS0FBZixlQUFlLFFBb0N4QjtBQUVELGtCQUFlLGVBQWUsQ0FBQyJ9