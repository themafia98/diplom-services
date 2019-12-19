"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = __importDefault(require("../../Utils"));
const Auth_1 = __importDefault(require("../../Models/Auth"));
var Tasks;
(function (Tasks) {
    Tasks.module = (app, route) => {
        if (!app)
            return null;
        const service = app.locals;
        route.get("/list", Auth_1.default.config.required, (req, res) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29udHJvbGxlcnMvVGFza3MvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSx3REFBZ0M7QUFHaEMsNkRBQXFDO0FBRXJDLElBQVUsS0FBSyxDQXdDZDtBQXhDRCxXQUFVLEtBQUs7SUFDRSxZQUFNLEdBQUcsQ0FBQyxHQUFRLEVBQUUsS0FBbUIsRUFBZSxFQUFFO1FBQ2pFLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDdEIsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUUzQixLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBQyxjQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQVksRUFBRSxHQUFhLEVBQUUsRUFBRTtZQUNwRSxJQUFJO2dCQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO3lCQUMxQixHQUFHLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7eUJBQzNCLE1BQU0sQ0FBQyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsQ0FBQzt5QkFDckMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQ3hDLEtBQUssRUFBRSxHQUFVLEVBQUUsSUFBWSxFQUFFLEtBQWEsRUFBaUIsRUFBRTt3QkFFN0QsSUFBSSxHQUFHLEVBQUU7NEJBQ0wsT0FBTyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0NBQ2pCLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSTtnQ0FDaEIsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFO2dDQUMxQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQ0FDeEIsWUFBWSxFQUFFLGVBQUssQ0FBQyxZQUFZLENBQU8sR0FBSSxDQUFDLEtBQUssQ0FBQztnQ0FDbEQsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTOzZCQUMxQixDQUFDLENBQUM7eUJBQ047d0JBRUQsT0FBTyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUM7NEJBQ2pCLE1BQU0sRUFBRSxNQUFNOzRCQUNkLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksRUFBRTs0QkFDNUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUU7NEJBQ3hCLFlBQVksRUFBRSxlQUFLLENBQUMsWUFBWSxDQUFPLEdBQUksQ0FBQyxLQUFLLENBQUM7NEJBQ2xELElBQUksRUFBRSxPQUFPLENBQUMsU0FBUzt5QkFDMUIsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVmLENBQUMsQ0FBQyxDQUFDO2FBQ047WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3RCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDLENBQUE7QUFDTCxDQUFDLEVBeENTLEtBQUssS0FBTCxLQUFLLFFBd0NkO0FBRUQsa0JBQWUsS0FBSyxDQUFDIn0=