"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const lodash_1 = __importDefault(require("lodash"));
const Utils_1 = __importDefault(require("../../Utils"));
var DatabaseActions;
(function (DatabaseActions) {
    DatabaseActions.routeDatabaseActions = () => {
        const responseCollection = {};
        let counter = 0;
        return async (operation, method, configSchema, callback, lengthActions) => {
            const builderResponse = async ({ collection = "", param = {} }) => {
                const { methodQuery = "" } = param;
                const collectionModel = configSchema && !lodash_1.default.isEmpty(configSchema) ?
                    Utils_1.default.getModelByName(configSchema['name'], configSchema['schemaType']) : null;
                param.from = collection;
                param.method = method;
                if (method && method.toLocaleUpperCase().trim() === 'GET') {
                    switch (methodQuery) {
                        case "all": {
                            if (collectionModel && !lodash_1.default.isNull(collectionModel)) {
                                try {
                                    return await collectionModel.find({}, (err, data) => {
                                        counter += 1;
                                        if (err) {
                                            responseCollection[method] = { param, metadata: null, isError: true };
                                            if (counter === lengthActions) {
                                                callback(new mongoose_1.Error(`Invalid query. methodQuery: ${methodQuery}.`), null, param);
                                            }
                                        }
                                        else
                                            responseCollection[method] = { metadata: data, param };
                                        if (counter === lengthActions)
                                            callback(err, responseCollection);
                                    });
                                }
                                catch (err) {
                                    if (counter === lengthActions)
                                        return void callback(err, null, param);
                                }
                            }
                            else
                                return void callback(new mongoose_1.Error(`Invalid model. methodQuery: ${methodQuery}.`), null, param);
                            break;
                        }
                        default: return null;
                    }
                }
                else if (method && method.toLocaleUpperCase().trim() === 'DELETE') {
                    switch (methodQuery) {
                        case "delete_all": {
                            if (collectionModel && !lodash_1.default.isNull(collectionModel)) {
                                try {
                                    return await collectionModel.find({}, (err, data) => {
                                        counter += 1;
                                        if (err) {
                                            responseCollection[method] = { param, metadata: null, isError: true };
                                            if (counter === lengthActions) {
                                                callback(new mongoose_1.Error(`Invalid query. methodQuery: ${methodQuery}.`), null, param);
                                            }
                                        }
                                        else
                                            responseCollection[method] = { metadata: data, param };
                                        if (counter === lengthActions)
                                            callback(err, responseCollection);
                                    });
                                }
                                catch (err) {
                                    if (counter === lengthActions)
                                        callback(err, null, param);
                                }
                            }
                            else
                                return void callback(new mongoose_1.Error(`Invalid model. methodQuery: ${methodQuery}.`), null, param);
                            break;
                        }
                        default: return null;
                    }
                }
                else
                    return void callback(new mongoose_1.Error(`Invalid method. methodQuery: ${methodQuery}.`), null, param);
            };
            if (!lodash_1.default.isObject(operation) && !method)
                return null;
            return builderResponse(operation);
        };
    };
})(DatabaseActions || (DatabaseActions = {}));
exports.default = DatabaseActions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2RlbHMvRGF0YWJhc2UvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVDQUE0RTtBQUM1RSxvREFBdUI7QUFHdkIsd0RBQWdDO0FBRWhDLElBQVUsZUFBZSxDQXdFeEI7QUF4RUQsV0FBVSxlQUFlO0lBRVIsb0NBQW9CLEdBQUcsR0FBRyxFQUFFO1FBQ3JDLE1BQU0sa0JBQWtCLEdBQVcsRUFBRSxDQUFDO1FBQ3RDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNoQixPQUFPLEtBQUssRUFBRSxTQUFpQixFQUFFLE1BQWMsRUFBRSxZQUEwQixFQUFFLFFBQWtCLEVBQUUsYUFBcUIsRUFBRSxFQUFFO1lBQ3RILE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxFQUFFLFVBQVUsR0FBRyxFQUFFLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxFQUF1RCxFQUFFO2dCQUNuSCxNQUFNLEVBQUUsV0FBVyxHQUFHLEVBQUUsRUFBRSxHQUFpQixLQUFNLENBQUM7Z0JBQ2xELE1BQU0sZUFBZSxHQUFHLFlBQVksSUFBSSxDQUFDLGdCQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQzlELGVBQUssQ0FBQyxjQUFjLENBQVMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFVLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBRTVGLEtBQU0sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO2dCQUN6QixLQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDN0IsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssS0FBSyxFQUFFO29CQUN2RCxRQUFRLFdBQVcsRUFBRTt3QkFDakIsS0FBSyxLQUFLLENBQUMsQ0FBQzs0QkFD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