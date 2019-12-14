"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const Server_1 = __importDefault(require("./Models/Server"));
if (process.env.NODE_ENV === "production") {
    /** nginx init */
    fs_1.default.openSync("/tmp/app-initialized", "w");
}
var Entrypoint;
(function (Entrypoint) {
    const cpuLentgh = os_1.default.cpus().length;
    if (cluster_1.default.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster_1.default.fork();
            cluster_1.default.on("exit", (worker, code, signal) => {
                console.log(`${chalk_1.default.yellow("worker")} ${chalk_1.default.red(worker.process.pid)} exit.`);
                const child = cluster_1.default.fork();
                console.log(`New ${chalk_1.default.yellow("worker")} ${chalk_1.default.red(child.process.pid)} born.`);
            });
        }
    }
    else {
        try {
            const app = new Server_1.default(process.env.APP_PORT || "3001");
            app.start();
        }
        catch (err) {
            console.error(err);
            process.kill(process.ppid); // delay
        }
    }
})(Entrypoint || (Entrypoint = {}));
exports.default = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBMEM7QUFDMUMsa0RBQTBCO0FBQzFCLDRDQUFvQjtBQUNwQiw0Q0FBb0I7QUFFcEIsNkRBQTJDO0FBRTNDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxFQUFFO0lBQ3ZDLGlCQUFpQjtJQUNqQixZQUFFLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQzVDO0FBRUQsSUFBVSxVQUFVLENBd0JuQjtBQXhCRCxXQUFVLFVBQVU7SUFDaEIsTUFBTSxTQUFTLEdBQVcsWUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUUzQyxJQUFJLGlCQUFPLENBQUMsUUFBUSxFQUFFO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVmLGlCQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQWMsRUFBRSxJQUFZLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGVBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRWhGLE1BQU0sS0FBSyxHQUFHLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxlQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGVBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkYsQ0FBQyxDQUFDLENBQUM7U0FDTjtLQUNKO1NBQU07UUFDSCxJQUFJO1lBQ0EsTUFBTSxHQUFHLEdBQWMsSUFBSSxnQkFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxDQUFDO1lBQ3hFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUVmO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUTtTQUN2QztLQUNKO0FBQ0wsQ0FBQyxFQXhCUyxVQUFVLEtBQVYsVUFBVSxRQXdCbkI7QUFFRCxrQkFBZSxVQUFVLENBQUMifQ==