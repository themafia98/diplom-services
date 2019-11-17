"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
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
        route.get('*', (req, res) => {
            res.sendFile(path_1.default.join(__dirname + '/client/build/index.html'));
        });
        process.on("SIGTERM", () => {
            server.close();
        });
    }
})(Entrypoint || (Entrypoint = {}));
exports.default = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxzREFBNkQ7QUFDN0QsZ0RBQXdCO0FBQ3hCLHNEQUE4QjtBQUM5Qiw0Q0FBb0I7QUFJcEIsSUFBVSxVQUFVLENBbUNuQjtBQW5DRCxXQUFVLFVBQVU7SUFFaEIsTUFBTSxTQUFTLEdBQUcsWUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUVuQyxJQUFJLGlCQUFPLENBQUMsUUFBUSxFQUFFO1FBRWxCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNsQjtLQUVKO1NBQU07UUFFSCxNQUFNLEdBQUcsR0FBRyxpQkFBTyxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWhDLE1BQU0sSUFBSSxHQUFXLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQztRQUVoRCxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0QixNQUFNLE1BQU0sR0FBVyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7WUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLElBQUksR0FBRyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLEtBQUssR0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUUvQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUN4QixHQUFHLENBQUMsUUFBUSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLDBCQUEwQixDQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtZQUN2QixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUE7S0FDTDtBQUNMLENBQUMsRUFuQ1MsVUFBVSxLQUFWLFVBQVUsUUFtQ25CO0FBRUQsa0JBQWUsVUFBVSxDQUFDIn0=