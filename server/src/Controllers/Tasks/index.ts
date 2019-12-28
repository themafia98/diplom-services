import { Request, Response, Router as RouteExpress, NextFunction, Application } from 'express';
import Utils from '../../Utils';
import { App } from '../../Utils/Interfaces';
import Decorators from '../../Decorators';
import Auth from '../../Models/Auth';

namespace Tasks {
    const Controller = Decorators.Controller;
    const Get = Decorators.Get;
    export class TasksController {
        @Get({ path: "/list", private: true })
        public async getList(req: Request, res: Response, next: NextFunction, server: Application): Promise<void> {
            try {
                const service = server.locals;
                await service.dbm.connection();
                service.dbm.collection("tasks")
                    .get({ methodQuery: "all" })
                    .delete({ methodQuery: "delete_all" })
                    .start({ name: "tasks", schemaType: "task" },
                        async (err: Error, data: Object, param: Object): Promise<void> => {
                            await service.dbm.disconnect();
                            if (err) {
                                return void res.json({
                                    action: err.name,
                                    response: { param, metadata: err.message },
                                    uptime: process.uptime(),
                                    responseTime: Utils.responseTime((<any>req).start),
                                    work: process.connected
                                });
                            }

                            return void res.json({
                                action: "done",
                                response: { param, ...data },
                                uptime: process.uptime(),
                                responseTime: Utils.responseTime((<any>req).start),
                                work: process.connected
                            });
                        });

            } catch (err) {
                console.error(err);
            }
        }
    }
}

export default Tasks;
