import { Request, Response, NextFunction } from "express";
import Utils from "../../Utils";
import { App } from "../../Utils/Interfaces";
import Decorators from "../../Decorators";

namespace Tasks {
    const Controller = Decorators.Controller;
    const Post = Decorators.Post;

    @Controller("/tasks")
    export class TasksController {
        @Post({ path: "/list", private: true })
        public async getList(req: Request, res: Response, next: NextFunction, server: App): Promise<Response> {
            try {
                const { methodQuery = "all" } = req.body;

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

                            return res.json({
                                action: "done",
                                response: { param, ...data },
                                uptime: process.uptime(),
                                responseTime: Utils.responseTime((<any>req).start),
                                work: process.connected
                            });
                        }
                    );

                return res.sendStatus(503);
            } catch (err) {
                console.error(err);
                return res.sendStatus(503);
            }
        }
    }
}

export default Tasks;
