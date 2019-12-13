import { Request, Response, Router as RouteExpress } from 'express';

import { App } from '../../Utils/Interfaces';

namespace Tasks {
    export const module = (app: App, route: RouteExpress): null | void => {
        if (!app) return null;
        const service = app.locals;

        route.get("/list", (req: Request, res: Response) => {
            service.dbm.connection().then(() => {
                service.dbm.collection("tasks").get({ methodQuery: "all" }).start({ name: "tasks", schemaType: "task" },
                    (err: Error, data: Object): void => {
                        service.dbm.disconnect();
                        let response = data;
                        console.log(response);
                        if (err) {
                            response = { message: err.message };
                            return void res.json({ action: err.name, response });
                        }
                        res.json({ action: "done", response });
                    });

            })
        });
    }
}

export default Tasks;
