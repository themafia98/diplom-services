import { Request, Response, Router as RouteExpress } from 'express';
import Utils from '../../Utils';
import { App } from '../../Utils/Interfaces';

import Auth from '../../Models/Auth';

namespace Tasks {
    export const module = (app: App, route: RouteExpress): null | void => {
        if (!app) return null;
        const service = app.locals;

        route.get("/list", Auth.config.required, async (req: Request, res: Response): Promise<void> => {
            try {
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
        });
    }
}

export default Tasks;
