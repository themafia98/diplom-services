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
    const coreCpuCount = os_1.default.cpus().length;
    if (cluster_1.default.isMaster) {
        for (let i = 0; i < coreCpuCount; i++) {
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
        route.get("/", (request, response) => {
            return void response.sendStatus(200);
        });
        process.on("SIGTERM", () => {
            server.close();
        });
    }
})(Entrypoint || (Entrypoint = {}));
exports.default = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHNEQUE2RDtBQUM3RCxzREFBOEI7QUFDOUIsNENBQW9CO0FBSXBCLElBQVUsVUFBVSxDQW1DbkI7QUFuQ0QsV0FBVSxVQUFVO0lBRWhCLE1BQU0sWUFBWSxHQUFHLFlBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFFdEMsSUFBSSxpQkFBTyxDQUFDLFFBQVEsRUFBRTtRQUVsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25DLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDbEI7S0FFSjtTQUFNO1FBRUgsTUFBTSxHQUFHLEdBQUcsaUJBQU8sRUFBRSxDQUFDO1FBQ3RCLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsaUJBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVoQyxNQUFNLElBQUksR0FBVyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUM7UUFFaEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEIsTUFBTSxNQUFNLEdBQVcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztZQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLEdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFL0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFnQixFQUFFLFFBQWtCLEVBQVEsRUFBRTtZQUMxRCxPQUFPLEtBQUssUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtZQUN2QixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUE7S0FDTDtBQUNMLENBQUMsRUFuQ1MsVUFBVSxLQUFWLFVBQVUsUUFtQ25CO0FBRUQsa0JBQWUsVUFBVSxDQUFDIn0=