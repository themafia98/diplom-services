"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
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
        this.getApp().use(helmet_1.default());
        this.getApp().set("port", this.port);
        const instanceRouter = Router_1.default.Router.instance(this.getApp());
        const server = this.getApp().listen(this.port, () => {
            console.log(`${chalk_1.default.yellow(`Worker ${process.pid}`)} ${chalk_1.default.green("started")}`);
            console.log(`Server or worker listen on ${chalk_1.default.blue.bold(this.port)}.`);
        });
        const rest = instanceRouter.initInstance("/rest");
        const dogs = instanceRouter.createRoute("/dogs");
        rest.get("/", (req, res) => {
            console.log(`${chalk_1.default.red("Requset url:")} ${chalk_1.default.blue(req.baseUrl)}`);
            res.type("application/json");
            res.json({ content: "HI!" });
        });
        dogs.get("/", (req, res) => {
            console.log(`${chalk_1.default.red("Requset url:")} ${chalk_1.default.blue(req.baseUrl)}`);
            res.type("application/json");
            res.json({ content: "DOGS!" });
        });
        // if (process.env.NODE_ENV === "production") {
        //     this.getApp().use(express.static(process.cwd() + "/client/build"));
        //     this.getApp().get("*", (req: Request, res: Response) => {
        //         res.sendFile(process.cwd() + "/client/build/index.html");
        //     });
        // }
        process.on("SIGTERM", () => {
            server.close();
        });
    }
}
exports.default = ServerRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1NlcnZlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUFrRTtBQUNsRSxvREFBNEI7QUFDNUIsa0RBQTBCO0FBRTFCLHVEQUF1QztBQUl2QyxNQUFNLFlBQVk7SUFJZCxZQUFZLElBQVk7UUFGaEIsZ0JBQVcsR0FBdUIsSUFBSSxDQUFDO1FBRzNDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBb0IsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN6QyxDQUFDO0lBRU0sTUFBTSxDQUFDLE9BQW9CO1FBQzlCLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJO1lBQUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7SUFDOUQsQ0FBQztJQUVNLEtBQUs7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxnQkFBTSxFQUFFLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckMsTUFBTSxjQUFjLEdBQVUsZ0JBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLE1BQU0sTUFBTSxHQUFlLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFTLEVBQUU7WUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxlQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixlQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWpELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO1lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLGVBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2RSxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDN0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLEVBQUU7WUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsMEVBQTBFO1FBQzFFLGdFQUFnRTtRQUNoRSxvRUFBb0U7UUFDcEUsVUFBVTtRQUNWLElBQUk7UUFFSixPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFTLEVBQUU7WUFDN0IsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBRUQsa0JBQWUsWUFBWSxDQUFDIn0=