"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const Utils_1 = __importDefault(require("../../Utils"));
var DatabaseActions;
(function (DatabaseActions) {
    DatabaseActions.routeDatabaseActions = async (operation, method, configSchema, callback) => {
        const GET = ({ collection = "", param = {} }) => {
            const { metadataSearch = {}, methodQuery = "" } = param;
            const collectionModel = configSchema && !lodash_1.default.isEmpty(configSchema) ?
                Utils_1.default.getModelByName(configSchema['name'], configSchema['schemaType']) : null;
            switch (methodQuery) {
                case "all":
                    return collectionModel && !lodash_1.default.isNull(collectionModel) ? collectionModel.find({}, callback) :
                        callback(new Error(`Invalid. methodQuery: ${methodQuery}.`), { status: "Invalid" });
                default: return null;
            }
        };
        if (!lodash_1.default.isObject(operation) && !method)
            return;
        switch (method) {
            case "GET": return GET(operation);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvRGF0YWJhc2UvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLG9EQUF1QjtBQUd2Qix3REFBZ0M7QUFFaEMsSUFBVSxlQUFlLENBbUN4QjtBQW5DRCxXQUFVLGVBQWU7SUFFUixvQ0FBb0IsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxNQUFjLEVBQUUsWUFBMEIsRUFBRSxRQUFrQixFQUFFLEVBQUU7UUFDNUgsTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxFQUFFLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxFQUE4QyxFQUFFO1lBRXhGLE1BQU0sRUFBRSxjQUFjLEdBQUcsRUFBRSxFQUFFLFdBQVcsR0FBRyxFQUFFLEVBQUUsR0FBaUIsS0FBTSxDQUFDO1lBQ3ZFLE1BQU0sZUFBZSxHQUFHLFlBQVksSUFBSSxDQUFDLGdCQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQzlELGVBQUssQ0FBQyxjQUFjLENBQVMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFVLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFbEcsUUFBUSxXQUFXLEVBQUU7Z0JBQ2pCLEtBQUssS0FBSztvQkFDTixPQUFPLGVBQWUsSUFBSSxDQUFDLGdCQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUN2RixRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMseUJBQXlCLFdBQVcsR0FBRyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDNUYsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUM7YUFDeEI7UUFDTCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsZ0JBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUU5QyxRQUFRLE1BQU0sRUFBRTtZQUNaLEtBQUssS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQVksU0FBUyxDQUFDLENBQUM7WUFFN0MsS0FBSyxLQUFLLENBQUMsQ0FBQztnQkFDUixNQUFNO2FBQ1Q7WUFFRCxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUNYLE1BQU07YUFDVDtZQUVELEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ1gsTUFBTTthQUNUO1NBQ0o7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDLEVBbkNTLGVBQWUsS0FBZixlQUFlLFFBbUN4QjtBQUVELGtCQUFlLGVBQWUsQ0FBQyJ9