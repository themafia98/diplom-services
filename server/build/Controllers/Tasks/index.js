"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = __importDefault(require("../../Utils"));
var Tasks;
(function (Tasks) {
    Tasks.module = (app, route) => {
        if (!app)
            return null;
        const service = app.locals;
        route.get("/list", (req, res) => {
            try {
                service.dbm.connection().then(() => {
                    service.dbm.collection("tasks")
                        .get({ methodQuery: "all" })
                        .delete({ methodQuery: "delete_all" })
                        .start({ name: "tasks", schemaType: "task" }, async (err, data, param) => {
                        if (err) {
                            return void res.json({
                                action: err.name,
                                response: { param, metadata: err.message },
                                uptime: process.uptime(),
                                responseTime: Utils_1.default.responseTime(req.start),
                                work: process.connected
                            });
                        }
                        return void res.json({
                            action: "done",
                            response: { param, ...data },
                            uptime: process.uptime(),
                            responseTime: Utils_1.default.responseTime(req.start),
                            work: process.connected
                        });
                    });
                });
            }
            catch (err) {
                console.error(err);
            }
        });
    };
})(Tasks || (Tasks = {}));
exports.default = Tasks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29udHJvbGxlcnMvVGFza3MvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSx3REFBZ0M7QUFHaEMsSUFBVSxLQUFLLENBd0NkO0FBeENELFdBQVUsS0FBSztJQUNFLFlBQU0sR0FBRyxDQUFDLEdBQVEsRUFBRSxLQUFtQixFQUFlLEVBQUU7UUFDakUsSUFBSSxDQUFDLEdBQUc7WUFBRSxPQUFPLElBQUksQ0FBQztRQUN0QixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBRTNCLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO1lBQy9DLElBQUk7Z0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7eUJBQzFCLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQzt5QkFDM0IsTUFBTSxDQUFDLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxDQUFDO3lCQUNyQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsRUFDeEMsS0FBSyxFQUFFLEdBQVUsRUFBRSxJQUFZLEVBQUUsS0FBYSxFQUFpQixFQUFFO3dCQUU3RCxJQUFJLEdBQUcsRUFBRTs0QkFDTCxPQUFPLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQztnQ0FDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJO2dDQUNoQixRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUU7Z0NBQzFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFO2dDQUN4QixZQUFZLEVBQUUsZUFBSyxDQUFDLFlBQVksQ0FBTyxHQUFJLENBQUMsS0FBSyxDQUFDO2dDQUNsRCxJQUFJLEVBQUUsT0FBTyxDQUFDLFNBQVM7NkJBQzFCLENBQUMsQ0FBQzt5QkFDTjt3QkFFRCxPQUFPLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQzs0QkFDakIsTUFBTSxFQUFFLE1BQU07NEJBQ2QsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxFQUFFOzRCQUM1QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRTs0QkFDeEIsWUFBWSxFQUFFLGVBQUssQ0FBQyxZQUFZLENBQU8sR0FBSSxDQUFDLEtBQUssQ0FBQzs0QkFDbEQsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTO3lCQUMxQixDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRWYsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUMsQ0FBQTtBQUNMLENBQUMsRUF4Q1MsS0FBSyxLQUFMLEtBQUssUUF3Q2Q7QUFFRCxrQkFBZSxLQUFLLENBQUMifQ==