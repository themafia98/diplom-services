"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lodash_1 = __importDefault(require("lodash"));
const helmet_1 = __importDefault(require("helmet"));
const chalk_1 = __importDefault(require("chalk"));
const Router_1 = __importDefault(require("../Router"));
const Tasks_1 = __importDefault(require("../../Controllers/Tasks"));
const Database_1 = __importDefault(require("../Database"));
const Security_1 = __importDefault(require("../Security"));
class ServerRunner {
    constructor(port) {
        this.application = null;
        this.port = port;
    }
    getPort() {
        return this.port;
    }
    getApp() {
        return this.application;
    }
    setApp(express) {
        if (lodash_1.default.isNull(this.application))
            this.application = express;
    }
    start() {
        this.setApp(express_1.default());
        this.getApp().disabled("x-powerd-by");
        this.getApp().use(helmet_1.default());
        this.getApp().set("port", this.getPort());
        const instanceRouter = Router_1.default.Router.instance(this.getApp());
        const server = this.getApp().listen(this.getPort(), () => {
            console.log(`${chalk_1.default.yellow(`Worker ${process.pid}`)} ${chalk_1.default.green("started")}`);
            console.log(`Server or worker listen on ${chalk_1.default.blue.bold(this.port)}.`);
        });
        /** initial entrypoint route */
        instanceRouter.initInstance("/rest");
        this.getApp().locals.hash = new Security_1.default.Crypto();
        this.getApp().locals.dbm = new Database_1.default.ManagmentDatabase("controllSystem", process.env.MONGODB_URI);
        Tasks_1.default.module(this.getApp(), instanceRouter.createRoute("/tasks"));
        process.on("SIGTERM", () => {
            console.log("SIGTERM, uptime:", process.uptime());
            server.close();
        });
    }
}
exports.default = ServerRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1NlcnZlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUErQztBQUMvQyxvREFBdUI7QUFDdkIsb0RBQTRCO0FBQzVCLGtEQUEwQjtBQUUxQix1REFBdUM7QUFJdkMsb0VBQTRDO0FBQzVDLDJEQUFtQztBQUNuQywyREFBbUM7QUFFbkMsTUFBTSxZQUFZO0lBSWQsWUFBWSxJQUFZO1FBRmhCLGdCQUFXLEdBQXVCLElBQUksQ0FBQztRQUczQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRU0sTUFBTTtRQUNULE9BQW9CLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDekMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxPQUFvQjtRQUM5QixJQUFJLGdCQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7WUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztJQUMvRCxDQUFDO0lBRU0sS0FBSztRQUVSLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQU8sRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLGdCQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTFDLE1BQU0sY0FBYyxHQUFVLGdCQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUU1RSxNQUFNLE1BQU0sR0FBZSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFTLEVBQUU7WUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxlQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixlQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO1FBRUgsK0JBQStCO1FBQy9CLGNBQWMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxrQkFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksa0JBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdHLGVBQUssQ0FBQyxNQUFNLENBQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLGNBQWMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUV2RSxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFTLEVBQUU7WUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFFRCxrQkFBZSxZQUFZLENBQUMifQ==