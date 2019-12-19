"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const lodash_1 = __importDefault(require("lodash"));
const Server_1 = __importDefault(require("./Models/Server"));
if (process.env.NODE_ENV === "production") {
    /** nginx init */
    fs_1.default.openSync("/tmp/app-initialized", "w");
}
var Entrypoint;
(function (Entrypoint) {
    const cpuLentgh = os_1.default.cpus().length;
    const callbackExit = lodash_1.default.debounce((worker, code, signal) => {
        console.log(`${chalk_1.default.yellow("worker")} ${chalk_1.default.red(worker.process.pid)} exit.`);
        const child = cluster_1.default.fork();
        console.log(`New ${chalk_1.default.yellow("worker")} ${chalk_1.default.red(child.process.pid)} born.`);
    }, 300);
    if (cluster_1.default.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster_1.default.fork();
            cluster_1.default.on("exit", callbackExit);
        }
    }
    else {
        try {
            const app = new Server_1.default(process.env.APP_PORT || "3001");
            app.start();
        }
        catch (err) {
            console.error(err);
            process.kill(process.ppid);
        }
    }
})(Entrypoint || (Entrypoint = {}));
exports.default = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBMEM7QUFDMUMsa0RBQTBCO0FBQzFCLDRDQUFvQjtBQUNwQiw0Q0FBb0I7QUFFcEIsb0RBQXVCO0FBR3ZCLDZEQUEyQztBQUUzQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksRUFBRTtJQUN2QyxpQkFBaUI7SUFDakIsWUFBRSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUM1QztBQUVELElBQVUsVUFBVSxDQTBCbkI7QUExQkQsV0FBVSxVQUFVO0lBQ2hCLE1BQU0sU0FBUyxHQUFXLFlBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFHM0MsTUFBTSxZQUFZLEdBQUUsZ0JBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFjLEVBQUUsSUFBWSxFQUFFLE1BQWMsRUFBRSxFQUFFO1FBQzVFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGVBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFaEYsTUFBTSxLQUFLLEdBQUcsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sZUFBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxlQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZGLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUVSLElBQUksaUJBQU8sQ0FBQyxRQUFRLEVBQUU7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsaUJBQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ3BDO0tBQ0o7U0FBTTtRQUNILElBQUk7WUFDQSxNQUFNLEdBQUcsR0FBYyxJQUFJLGdCQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLENBQUM7WUFDeEUsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBRWY7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUI7S0FDSjtBQUNMLENBQUMsRUExQlMsVUFBVSxLQUFWLFVBQVUsUUEwQm5CO0FBRUQsa0JBQWUsVUFBVSxDQUFDIn0=