import { Request, Response, Router as RouteExpress } from 'express';

import { App } from '../../Utils/Interfaces';

namespace Tasks {
    export const module = (app: App, route: RouteExpress): null | void => {
        if (!app) return null;
        const service = app.locals;

        route.get("/list", (req: Request, res: Response) => {
            service.dbm.collection("tasks").get({ methodQuery: "all" }).start(null, (err: Error, data: Object) => {
                res.json(data);
            });
        });
    }
}

export default Tasks;
