"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const Server_1 = __importDefault(require("./Models/Server"));
var Entrypoint;
(function (Entrypoint) {
    const cpuLentgh = os_1.default.cpus().length;
    if (cluster_1.default.isMaster) {
        for (let i = 0; i < cpuLentgh; i++) {
            cluster_1.default.fork();
        }
    }
    else {
        const server = new Server_1.default(process.env.PORT || "3001");
        server.start();
    }
})(Entrypoint || (Entrypoint = {}));
exports.default = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBOEI7QUFDOUIsNENBQW9CO0FBRXBCLDZEQUEyQztBQUUzQyxJQUFVLFVBQVUsQ0FXbkI7QUFYRCxXQUFVLFVBQVU7SUFDaEIsTUFBTSxTQUFTLEdBQVcsWUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUUzQyxJQUFJLGlCQUFPLENBQUMsUUFBUSxFQUFFO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNsQjtLQUNKO1NBQU07UUFDSCxNQUFNLE1BQU0sR0FBYyxJQUFJLGdCQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUM7UUFDdkUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xCO0FBQ0wsQ0FBQyxFQVhTLFVBQVUsS0FBVixVQUFVLFFBV25CO0FBRUQsa0JBQWUsVUFBVSxDQUFDIn0=