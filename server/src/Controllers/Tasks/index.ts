import { Request, Response, Router as RouteExpress } from 'express';

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
                            let response = data;
                            console.log(response);
                            if (err) {
                                response = { message: err.message };
                                return void res.json({ action: err.name, response });
                            }
                            res.json({ action: "done", response });
                        });

                });
            } catch (err) {
                console.error(err);
            }
        });

    }
}

export default Tasks;
