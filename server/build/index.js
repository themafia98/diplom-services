"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
var Entrypoint;
(function (Entrypoint) {
    const cpuLentgh = os_1.default.cpus().length;
    if (cluster_1.default.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster_1.default.fork();
        }
    }
    else {
        const app = express_1.default();
        app.disabled("X-Powered-By");
        const router = express_1.default.Router();
        const port = process.env.PORT || "3001";
        app.set("port", port);
        const server = app.listen(port, () => {
            console.log(`Worker ${process.pid} started`);
            console.log(`Server or worker listen on ${port}.`);
        });
        const route = app.use("/rest", router);
        route.get("/rest", (req, res) => {
            res.sendStatus(200);
        });
        if (process.env.NODE_ENV === 'production') {
            app.use(express_1.default.static(process.cwd() + "/client/build"));
            app.get("*", (req, res) => {
                res.sendFile(process.cwd() + "/client/build/index.html");
            });
        }
        process.on("SIGTERM", () => {
            server.close();
        });
    }
})(Entrypoint || (Entrypoint = {}));
exports.default = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBc0U7QUFFdEUsc0RBQThCO0FBQzlCLDRDQUFvQjtBQUlwQixJQUFVLFVBQVUsQ0EyQ25CO0FBM0NELFdBQVUsVUFBVTtJQUVoQixNQUFNLFNBQVMsR0FBVyxZQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDO0lBRTNDLElBQUksaUJBQU8sQ0FBQyxRQUFRLEVBQUU7UUFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2xCO0tBRUo7U0FBTTtRQUVILE1BQU0sR0FBRyxHQUFZLGlCQUFPLEVBQUUsQ0FBQztRQUMvQixHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTdCLE1BQU0sTUFBTSxHQUFXLGlCQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFeEMsTUFBTSxJQUFJLEdBQVcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDO1FBRWhELEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXRCLE1BQU0sTUFBTSxHQUFXLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQVMsRUFBRTtZQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sS0FBSyxHQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRS9DLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO1lBQy9DLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksRUFBRTtZQUN2QyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3pELEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO2dCQUN6QyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRywwQkFBMEIsQ0FBQyxDQUFDO1lBQzdELENBQUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFTLEVBQUU7WUFDN0IsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFBO0tBQ0w7QUFDTCxDQUFDLEVBM0NTLFVBQVUsS0FBVixVQUFVLFFBMkNuQjtBQUVELGtCQUFlLFVBQVUsQ0FBQyJ9