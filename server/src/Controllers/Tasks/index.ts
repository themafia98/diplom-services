import { Request, Response, NextFunction } from "express";
import Utils from "../../Utils";
import { App } from "../../Utils/Interfaces";
import Decorators from "../../Decorators";

namespace Tasks {
    const Controller = Decorators.Controller;
    const Get = Decorators.Get;

    @Controller("/tasks")
    export class TasksController {
        @Get({ path: "/list", private: true })
        public async getList(req: Request, res: Response, next: NextFunction, server: App): Promise<void> {
            try {
                const { methodQuery = "all" } = req.body;
                console.log(req.body);
                const service = server.locals;
                await service.dbm.connection();
                service.dbm
                    .collection("tasks")
                    .get({ methodQuery })
                    .start(
                        { name: "tasks", schemaType: "task" },
                        async (err: Error, data: any, param: Object): Promise<Response> => {
                            await service.dbm.disconnect();
                            if (err) {
                                return res.json({
                                    action: err.name,
                                    response: { param, metadata: err.message },
                                    uptime: process.uptime(),
                                    responseTime: Utils.responseTime((<any>req).start),
                                    work: process.connected
                                });
                            }
                            console.log(data);
                            return res.json({
                                action: "done",
                                response: { param, ...data },
                                uptime: process.uptime(),
                                responseTime: Utils.responseTime((<any>req).start),
                                work: process.connected
                            });
                        }
                    );
            } catch (err) {
                console.error(err);
            }
        }
    }
}

export default Tasks;
