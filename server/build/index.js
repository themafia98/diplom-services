"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
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
                console.log(`worker ${worker.process.pid} exit.`);
                const child = cluster_1.default.fork();
                console.log(`New worker ${child.process.pid} born.`);
            });
        }
    }
    else {
        try {
            const server = new Server_1.default(process.env.APP_PORT || "3001");
            server.start();
        }
        catch (err) {
            console.log(err);
        }
    }
})(Entrypoint || (Entrypoint = {}));
exports.default = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBMEM7QUFDMUMsNENBQW9CO0FBQ3BCLDRDQUFvQjtBQUVwQiw2REFBMkM7QUFFM0MsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLEVBQUU7SUFDdkMsaUJBQWlCO0lBQ2pCLFlBQUUsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDNUM7QUFFRCxJQUFVLFVBQVUsQ0FzQm5CO0FBdEJELFdBQVUsVUFBVTtJQUNoQixNQUFNLFNBQVMsR0FBVyxZQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDO0lBRTNDLElBQUksaUJBQU8sQ0FBQyxRQUFRLEVBQUU7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWYsaUJBQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBYyxFQUFFLElBQVksRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztnQkFFbEQsTUFBTSxLQUFLLEdBQUcsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztZQUN6RCxDQUFDLENBQUMsQ0FBQztTQUNOO0tBQ0o7U0FBTTtRQUNILElBQUk7WUFDQSxNQUFNLE1BQU0sR0FBYyxJQUFJLGdCQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2xCO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3BCO0tBQ0o7QUFDTCxDQUFDLEVBdEJTLFVBQVUsS0FBVixVQUFVLFFBc0JuQjtBQUVELGtCQUFlLFVBQVUsQ0FBQyJ9