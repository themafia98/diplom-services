"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tasks;
(function (Tasks) {
    Tasks.module = (app, route) => {
        if (!app)
            return null;
        const service = app.locals;
        route.get("/list", (req, res) => {
            try {
                service.dbm.connection().then(() => {
                    service.dbm.collection("tasks").get({ methodQuery: "all" }).start({ name: "tasks", schemaType: "task" }, (err, data) => {
                        service.dbm.disconnect();
                        let response = data;
                        if (err) {
                            response = { message: err.message };
                            return void res.json({ action: err.name, response });
                        }
                        res.json({ action: "done", response });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29udHJvbGxlcnMvVGFza3MvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxJQUFVLEtBQUssQ0EyQmQ7QUEzQkQsV0FBVSxLQUFLO0lBQ0UsWUFBTSxHQUFHLENBQUMsR0FBUSxFQUFFLEtBQW1CLEVBQWUsRUFBRTtRQUNqRSxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3RCLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFFM0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLEVBQUU7WUFDL0MsSUFBSTtnQkFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxFQUNuRyxDQUFDLEdBQVUsRUFBRSxJQUFZLEVBQVEsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFDekIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO3dCQUVwQixJQUFJLEdBQUcsRUFBRTs0QkFDTCxRQUFRLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUNwQyxPQUFPLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7eUJBQ3hEO3dCQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7b0JBQzNDLENBQUMsQ0FBQyxDQUFDO2dCQUVYLENBQUMsQ0FBQyxDQUFDO2FBQ047WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3RCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDLENBQUE7QUFDTCxDQUFDLEVBM0JTLEtBQUssS0FBTCxLQUFLLFFBMkJkO0FBRUQsa0JBQWUsS0FBSyxDQUFDIn0=