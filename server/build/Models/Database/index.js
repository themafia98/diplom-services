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
                    Object.keys(this.getResponseParams()).forEach(async (method) => {
                        const operation = this.getResponseParams()[method][method];
                        return await actions_1.default.routeDatabaseActions(operation, method, configSchema, callback);
                    });
                }
            };
        }
        ;
        get db() {
            return this.dbClient;
        }
        getConnectionString() {
            return this.connectionString;
        }
        async connection() {
            if (this.getConnect() || !this.getConnectionString())
                return this.getConnect();
            try {
                this.connect = await mongoose_1.default.connect(this.getConnectionString(), {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                console.log(this.connect);
            }
            catch (err) {
                console.error(err);
            }
        }
        async disconnect() {
            if (this.getConnect()) {
                await mongoose_1.default.disconnect();
                return this.getConnect();
            }
            else
                return null;
        }
        getConnect() {
            if (this.connect)
                return this.connect;
            else
                return null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL0RhdGFiYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0RBQStFO0FBQy9FLG9EQUE0QjtBQUM1QixvREFBdUI7QUFDdkIsd0RBQXdDO0FBSXhDLElBQVUsUUFBUSxDQTZHakI7QUE3R0QsV0FBVSxRQUFRO0lBQ2QsZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQixNQUFhLGlCQUFpQjtRQU0xQixZQUFZLEVBQVUsRUFBRSxnQkFBd0I7WUFGeEMsbUJBQWMsR0FBcUIsRUFBRSxDQUFDO1lBRzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUM3QyxDQUFDO1FBRU8sVUFBVSxDQUFDLFVBQWtCO1lBQ2pDLE9BQU87Z0JBQ0gsR0FBRyxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN0RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsSUFBSSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN2RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsR0FBRyxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN0RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN6RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN6RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUks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