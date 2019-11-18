"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var RouterInstance;
(function (RouterInstance) {
    RouterInstance.instanceRoute = null;
    class Router {
        constructor(app) {
            this.entrypoint = app;
        }
        static instance(app) {
            if (RouterInstance.instanceRoute !== null)
                return RouterInstance.instanceRoute;
            else {
                RouterInstance.instanceRoute = new Router(app);
                return RouterInstance.instanceRoute;
            }
        }
        getEntrypoint() {
            return this.entrypoint;
        }
        static createRoute() {
            return express_1.default.Router();
        }
        initRoute(path, router) {
            this.getEntrypoint().use(path, router);
        }
    }
    RouterInstance.Router = Router;
    ;
})(RouterInstance || (RouterInstance = {}));
exports.default = RouterInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1JvdXRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUFvRjtBQUlwRixJQUFVLGNBQWMsQ0FpQ3ZCO0FBakNELFdBQVUsY0FBYztJQUVULDRCQUFhLEdBQWlCLElBQUksQ0FBQztJQUU5QyxNQUFhLE1BQU07UUFJZixZQUFZLEdBQWdCO1lBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO1FBQzFCLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQWdCO1lBQzVCLElBQUksZUFBQSxhQUFhLEtBQUssSUFBSTtnQkFBRSxPQUFjLGVBQUEsYUFBYSxDQUFDO2lCQUNuRDtnQkFDRCxlQUFBLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEMsT0FBTyxlQUFBLGFBQWEsQ0FBQzthQUN4QjtRQUNMLENBQUM7UUFFRCxhQUFhO1lBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7UUFFRCxNQUFNLENBQUMsV0FBVztZQUNkLE9BQU8saUJBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRUQsU0FBUyxDQUFDLElBQVksRUFBRSxNQUFvQjtZQUN4QyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzQyxDQUFDO0tBQ0o7SUEzQlkscUJBQU0sU0EyQmxCLENBQUE7SUFBQSxDQUFDO0FBRU4sQ0FBQyxFQWpDUyxjQUFjLEtBQWQsY0FBYyxRQWlDdkI7QUFHRCxrQkFBZSxjQUFjLENBQUMifQ==