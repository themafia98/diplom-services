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
        get init() {
            return this.initialization;
        }
        set init(value) {
            this.initialization = value;
        }
        static instance(app) {
            if (RouterInstance.instanceRoute !== null)
                return RouterInstance.instanceRoute;
            else {
                RouterInstance.instanceRoute = new Router(app);
                return RouterInstance.instanceRoute;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1JvdXRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUF1RTtBQUd2RSxJQUFVLGNBQWMsQ0FrRHZCO0FBbERELFdBQVUsY0FBYztJQUNULDRCQUFhLEdBQWlCLElBQUksQ0FBQztJQUU5QyxNQUFhLE1BQU07UUFLZixZQUFZLEdBQWdCO1lBSnBCLG1CQUFjLEdBQVksS0FBSyxDQUFDO1lBRWhDLGVBQVUsR0FBaUIsaUJBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUdoRCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUMxQixDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ0osT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxLQUFjO1lBQ25CLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQWdCO1lBQzVCLElBQUksZUFBQSxhQUFhLEtBQUssSUFBSTtnQkFBRSxPQUFjLGVBQUEsYUFBYSxDQUFDO2lCQUNuRDtnQkFDRCxlQUFBLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEMsT0FBTyxlQUFBLGFBQWEsQ0FBQzthQUN4QjtRQUNMLENBQUM7UUFFRCxPQUFPO1lBQ0gsT0FBb0IsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN4QyxDQUFDO1FBRUQsYUFBYTtZQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDO1FBRUQsWUFBWSxDQUFDLElBQVk7WUFDckIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtnQkFDckIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ3BCO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELFdBQVcsQ0FBQyxJQUFZLEVBQUUsSUFBYTtZQUNuQyxNQUFNLFFBQVEsR0FBaUIsaUJBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuQyxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO0tBQ0o7SUE5Q1kscUJBQU0sU0E4Q2xCLENBQUE7QUFDTCxDQUFDLEVBbERTLGNBQWMsS0FBZCxjQUFjLFFBa0R2QjtBQUVELGtCQUFlLGNBQWMsQ0FBQyJ9