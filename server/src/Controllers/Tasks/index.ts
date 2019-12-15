import { Request, Response, Router as RouteExpress } from 'express';
import Utils from '../../Utils';
import { App } from '../../Utils/Interfaces';

namespace Tasks {
    export const module = (app: App, route: RouteExpress): null | void => {
        if (!app) return null;
        const service = app.locals;

        route.get("/list", (req: Request, res: Response) => {
            try {
                service.dbm.connection().then(() => {
                    service.dbm.collection("tasks").get({ methodQuery: "all" }).start({ name: "tasks", schemaType: "task" },
                        async (err: Error, data: Object): Promise<void> => {

                            if (err) {
                                return void res.json({
                                    action: err.name,
                                    response: { from: "tasks", methodQuery: "all", metadata: err.message },
                                    uptime: process.uptime(),
                                    responseTime: Utils.responseTime((<any>req).start),
                                    work: process.connected
                                });
                            }

                            return void res.json({
                                action: "done",
                                response: { from: "tasks", methodQuery: "all", metadata: data },
                                uptime: process.uptime(),
                                responseTime: Utils.responseTime((<any>req).start),
                                work: process.connected
                            });
                        });

                });
            } catch (err) {
                console.error(err);
            }
        });

    }
}

export default Tasks;
