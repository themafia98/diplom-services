"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const Server_1 = __importDefault(require("./Models/Server"));
if (process.env.NODE_ENV === 'production') {
    fs_1.default.openSync("/tmp/app-initialized", "w"); // nginx init
}
var Entrypoint;
(function (Entrypoint) {
    const cpuLentgh = os_1.default.cpus().length;
    if (cluster_1.default.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster_1.default.fork();
        }
    }
    else {
        const server = new Server_1.default(process.env.PORT ? `${Number(process.env.PORT) + 1}` : "3001");
        server.start();
    }
})(Entrypoint || (Entrypoint = {}));
exports.default = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBOEI7QUFDOUIsNENBQW9CO0FBQ3BCLDRDQUFvQjtBQUVwQiw2REFBMkM7QUFFM0MsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLEVBQUU7SUFDdkMsWUFBRSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWE7Q0FDMUQ7QUFFRCxJQUFVLFVBQVUsQ0FXbkI7QUFYRCxXQUFVLFVBQVU7SUFDaEIsTUFBTSxTQUFTLEdBQVcsWUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUUzQyxJQUFJLGlCQUFPLENBQUMsUUFBUSxFQUFFO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNsQjtLQUNKO1NBQU07UUFDSCxNQUFNLE1BQU0sR0FBYyxJQUFJLGdCQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNsQjtBQUNMLENBQUMsRUFYUyxVQUFVLEtBQVYsVUFBVSxRQVduQjtBQUVELGtCQUFlLFVBQVUsQ0FBQyJ9