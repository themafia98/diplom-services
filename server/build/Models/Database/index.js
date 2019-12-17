"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const lodash_1 = __importDefault(require("lodash"));
const actions_1 = __importDefault(require("./actions"));
var Database;
(function (Database) {
    dotenv_1.default.config();
    class ManagmentDatabase {
        constructor(db, connectionString) {
            this.responseParams = {};
            mongoose_1.default.set("debug", true);
            mongoose_1.default.set("useCreateIndex", true);
            this.dbClient = db;
            this.connectionString = connectionString;
        }
        operations(collection) {
            return {
                get: (param = {}) => {
                    const data = lodash_1.default.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ GET: data });
                    return this.operations(collection);
                },
                post: (param = {}) => {
                    const data = lodash_1.default.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ POST: data });
                    return this.operations(collection);
                },
                put: (param = {}) => {
                    const data = lodash_1.default.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ PUT: data });
                    return this.operations(collection);
                },
                delete: (param = {}) => {
                    const data = lodash_1.default.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ DELETE: data });
                    return this.operations(collection);
                },
                update: (param = {}) => {
                    const data = lodash_1.default.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ UPDATE: data });
                    return this.operations(collection);
                },
                start: async (configSchema, callback) => {
                    const responseKeys = Object.keys(this.getResponseParams());
                    const responseBuilder = actions_1.default.routeDatabaseActions();
                    responseKeys.forEach(async (method) => {
                        const operation = this.getResponseParams()[method][method];
                        await responseBuilder(operation, method, configSchema, callback, responseKeys.length);
                    });
                }
            };
        }
        get db() {
            return this.dbClient;
        }
        getConnectionString() {
            return this.connectionString;
        }
        async connection() {
            console.log(this.getConnectionString());
            if (this.getConnect() || !this.getConnectionString())
                return this.getConnect();
            try {
                this.connect = await mongoose_1.default.connect(this.getConnectionString(), {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
            }
            catch (err) {
                console.error(err);
            }
        }
        async disconnect() {
            if (this.getConnect()) {
                await this.getConnect().disconnect();
                return this.getConnect();
            }
            else
                return null;
        }
        getConnect() {
            return this.connect;
        }
        getResponseParams() {
            return this.responseParams;
        }
        setResponse(config) {
            this.responseParams = config || {};
            return this;
        }
        setResponseParams(param) {
            const key = Object.keys(param);
            if (!key)
                return;
            this.responseParams[key[0]] = Object.assign(param, {});
        }
        clearResponseParams() {
            this.responseParams = {};
            return this;
        }
        collection(name) {
            return this.operations(name);
        }
    }
    Database.ManagmentDatabase = ManagmentDatabase;
})(Database || (Database = {}));
exports.default = Database;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL0RhdGFiYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0RBQStFO0FBQy9FLG9EQUE0QjtBQUM1QixvREFBdUI7QUFDdkIsd0RBQXdDO0FBSXhDLElBQVUsUUFBUSxDQWdIakI7QUFoSEQsV0FBVSxRQUFRO0lBQ2QsZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQixNQUFhLGlCQUFpQjtRQU0xQixZQUFZLEVBQVUsRUFBRSxnQkFBd0I7WUFGeEMsbUJBQWMsR0FBcUIsRUFBRSxDQUFDO1lBRzFDLGtCQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QixrQkFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDN0MsQ0FBQztRQUVPLFVBQVUsQ0FBQyxVQUFrQjtZQUNqQyxPQUFPO2dCQUNILEdBQUcsRUFBRSxDQUFDLFFBQXdCLEVBQUUsRUFBd0IsRUFBRTtvQkFDdEQsTUFBTSxJQUFJLEdBQUcsZ0JBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO29CQUN2RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDdEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2dCQUNELElBQUksRUFBRSxDQUFDLFFBQXdCLEVBQUUsRUFBd0IsRUFBRTtvQkFDdkQsTUFBTSxJQUFJLEdBQUcsZ0JBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO29CQUN2RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDdkMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2dCQUNELEdBQUcsRUFBRSxDQUFDLFFBQXdCLEVBQUUsRUFBd0IsRUFBRTtvQkFDdEQsTUFBTSxJQUFJLEdBQUcsZ0JBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO29CQUN2RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDdEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2dCQUNELE1BQU0sRUFBRSxDQUFDLFFBQXdCLEVBQUUsRUFBd0IsRUFBRTtvQkFDekQsTUFBTSxJQUFJLEdBQUcsZ0JBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO29CQUN2RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDekMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2dCQUNELE1BQU0sRUFBRSxDQUFDLFFBQXdCLEVBQUUsRUFBd0IsRUFBRTtvQkFDekQsTUFBTSxJQUFJLEdBQUcsZ0JBQUMsQ0FBQyxP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