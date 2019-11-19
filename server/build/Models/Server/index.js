"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chalk_1 = __importDefault(require("chalk"));
const Router_1 = __importDefault(require("../Router"));
class ServerRunner {
    constructor(port) {
        this.application = null;
        this.port = port;
    }
    getApp() {
        return this.application;
    }
    setApp(express) {
        if (this.application === null)
            this.application = express;
    }
    start() {
        this.setApp(express_1.default());
        this.getApp().disabled("x-powerd-by");
        this.getApp().set("port", this.port);
        const instanceRouter = Router_1.default.Router.instance(this.getApp());
        const server = this.getApp().listen(this.port, () => {
            console.log(`${chalk_1.default.yellow(`Worker ${process.pid}`)} ${chalk_1.default.green("started")}`);
            console.log(`Server or worker listen on ${chalk_1.default.blue.bold(this.port)}.`);
        });
        const rest = instanceRouter.initInstance("/rest");
        const dogs = instanceRouter.createRoute("/dogs");
        rest.get("/test", (req, res) => {
            console.log(`${chalk_1.default.red("Requset url:")} ${chalk_1.default.blue(req.baseUrl)}`);
            res.type("application/json");
            res.json({ content: "HI!" });
        });
        dogs.get("/", (req, res) => {
            console.log(`${chalk_1.default.red("Requset url:")} ${chalk_1.default.blue(req.baseUrl)}`);
            res.type("application/json");
            res.json({ content: "DOGS!" });
        });
        if (process.env.NODE_ENV === "production") {
            this.getApp().use(express_1.default.static(process.cwd() + "/client/build"));
            this.getApp().get("*", (req, res) => {
                res.sendFile(process.cwd() + "/client/build/index.html");
            });
        }
        process.on("SIGTERM", () => {
            server.close();
        });
    }
}
exports.default = ServerRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1NlcnZlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUFrRTtBQUNsRSxrREFBMEI7QUFFMUIsdURBQXVDO0FBSXZDLE1BQU0sWUFBWTtJQUlkLFlBQVksSUFBWTtRQUZoQixnQkFBVyxHQUF1QixJQUFJLENBQUM7UUFHM0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVNLE1BQU07UUFDVCxPQUFvQixJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3pDLENBQUM7SUFFTSxNQUFNLENBQUMsT0FBb0I7UUFDOUIsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUk7WUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztJQUM5RCxDQUFDO0lBRU0sS0FBSztRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQU8sRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckMsTUFBTSxjQUFjLEdBQVUsZ0JBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLE1BQU0sTUFBTSxHQUFlLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFTLEVBQUU7WUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxlQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixlQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWpELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLGVBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2RSxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDN0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLEVBQUU7WUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksRUFBRTtZQUN2QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLGlCQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO2dCQUNuRCxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRywwQkFBMEIsQ0FBQyxDQUFDO1lBQzdELENBQUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFTLEVBQUU7WUFDN0IsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBRUQsa0JBQWUsWUFBWSxDQUFDIn0=