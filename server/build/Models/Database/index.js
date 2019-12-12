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
        constructor(db) {
            this.responseParams = {};
            this.dbClient = db;
        }
        get db() {
            return this.dbClient;
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
                start: async () => {
                    Object.keys(this.getResponseParams()).forEach(async (param) => {
                        await this.connection();
                        await actions_1.default.routeDatabaseActions(Object.assign(this.getResponseParams()[param][param], {
                            method: Object.keys(this.getResponseParams()[param])[0]
                        }));
                        await this.disconnect();
                    });
                }
            };
        }
        async connection() {
            if (this.getConnect() || !process.env.MONGODB_URI)
                return this.getConnect();
            this.connect = await mongoose_1.default.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                connectTimeoutMS: 1000
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL0RhdGFiYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0RBQThDO0FBQzlDLG9EQUE0QjtBQUM1QixvREFBdUI7QUFDdkIsd0RBQXdDO0FBSXhDLElBQVUsUUFBUSxDQXFHakI7QUFyR0QsV0FBVSxRQUFRO0lBQ2QsZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQixNQUFhLGlCQUFpQjtRQUsxQixZQUFZLEVBQVU7WUFGZCxtQkFBYyxHQUFxQixFQUFFLENBQUM7WUFHMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQVcsRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO1FBRU8sVUFBVSxDQUFDLFVBQWtCO1lBQ2pDLE9BQU87Z0JBQ0gsR0FBRyxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN0RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsSUFBSSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN2RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsR0FBRyxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN0RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN6RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsUUFBd0IsRUFBRSxFQUF3QixFQUFFO29CQUN6RCxNQUFNLElBQUksR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7b0JBQ3ZFLElB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