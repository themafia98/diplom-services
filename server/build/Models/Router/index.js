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
            this.initialization = false;
            this.restClient = express_1.default.Router();
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
        get init() {
            return this.initialization;
        }
        set init(value) {
            this.initialization = value;
        }
        getRest() {
            return this.restClient;
        }
        getEntrypoint() {
            return this.entrypoint;
        }
        initInstance(path) {
            if (this.init === false) {
                this.getEntrypoint().use(path, this.getRest());
                this.init = true;
            }
            return this.getRest();
        }
        createRoute(path, flag) {
            const newRoute = express_1.default.Router();
            this.getRest().use(path, newRoute);
            return newRoute;
        }
    }
    RouterInstance.Router = Router;
})(RouterInstance || (RouterInstance = {}));
exports.default = RouterInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1JvdXRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUF1RTtBQUd2RSxJQUFVLGNBQWMsQ0FrRHZCO0FBbERELFdBQVUsY0FBYztJQUNULDRCQUFhLEdBQWlCLElBQUksQ0FBQztJQUU5QyxNQUFhLE1BQU07UUFLZixZQUFZLEdBQWdCO1lBSnBCLG1CQUFjLEdBQVksS0FBSyxDQUFDO1lBRWhDLGVBQVUsR0FBaUIsaUJBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUdoRCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUMxQixDQUFDO1FBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFnQjtZQUM1QixJQUFJLGVBQUEsYUFBYSxLQUFLLElBQUk7Z0JBQUUsT0FBYyxlQUFBLGFBQWEsQ0FBQztpQkFDbkQ7Z0JBQ0QsZUFBQSxhQUFhLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hDLE9BQU8sZUFBQSxhQUFhLENBQUM7YUFDeEI7UUFDTCxDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ0osT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxLQUFjO1lBQ25CLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLENBQUM7UUFFTSxPQUFPO1lBQ1YsT0FBb0IsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN4QyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQztRQUVNLFlBQVksQ0FBQyxJQUFZO1lBQzVCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzthQUNwQjtZQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTSxXQUFXLENBQUMsSUFBWSxFQUFFLElBQWE7WUFDMUMsTUFBTSxRQUFRLEdBQWlCLGlCQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkMsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQztLQUNKO0lBOUNZLHFCQUFNLFNBOENsQixDQUFBO0FBQ0wsQ0FBQyxFQWxEUyxjQUFjLEtBQWQsY0FBYyxRQWtEdkI7QUFFRCxrQkFBZSxjQUFjLENBQUMifQ==