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
            this.status = null;
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
            if (!this.getConnectionString())
                return this.getConnect();
            try {
                this.connect = await mongoose_1.default.connect(this.getConnectionString(), {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                return this.connect;
            }
            catch (err) {
                return void console.error(err);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL0RhdGFiYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0RBQStFO0FBQy9FLG9EQUE0QjtBQUM1QixvREFBdUI7QUFDdkIsd0RBQXdDO0FBSXhDLElBQVUsUUFBUSxDQWtIakI7QUFsSEQsV0FBVSxRQUFRO0lBQ2QsZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQixNQUFhLGlCQUFpQjtRQVExQixZQUFZLEVBQVUsRUFBRSxnQkFBd0I7WUFKeEMsbUJBQWMsR0FBcUIsRUFBRSxDQUFDO1lBRXZDLFdBQU0sR0FBTyxJQUFJLENBQUM7WUFHckIsa0JBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVCLGtCQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUM3QyxDQUFDO1FBRU8sVUFBVSxDQUFDLFVBQWtCO1lBQ2pDLE9BQU87Z0JBQ0gsR0FBRyxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN0RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsSUFBSSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN2RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsR0FBRyxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN0RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN6RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN6RCxN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