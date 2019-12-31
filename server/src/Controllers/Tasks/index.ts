import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import Utils from "../../Utils";
import { App } from "../../Utils/Interfaces";
import Decorators from "../../Decorators";

namespace Tasks {
    const Controller = Decorators.Controller;
    const Get = Decorators.Get;
    const Post = Decorators.Post;

    @Controller("/tasks")
    export class TasksController {
        @Get({ path: "/list", private: true })
        public async getList(req: Request, res: Response, next: NextFunction, server: App): Promise<Response | void> {
            try {
                const service = server.locals;
                await service.dbm.connection();
                service.dbm
                    .collection("tasks")
                    .get({ methodQuery: "all" })
                    .start(
                        { name: "tasks", schemaType: "task" },
                        async (err: Error, data: any, param: object): Promise<Response> => {
                            await service.dbm.disconnect().catch((err: Error) => {
                                console.error(err);
                            });
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
            } catch (err) {
                console.error(err);
                if (!res.headersSent) {
                    return res.json({
                        action: err.name,
                        response: "Server error",
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }
            }
        }

        @Post({ path: "/createTask", private: true })
        public async create(req: Request, res: Response, next: NextFunction, server: App): Promise<Response | void> {
            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
                    await dbm.connection().catch((err: Error) => console.error(err));
                    dbm.collection("tasks")
                        .set({ methodQuery: "set_single", body: req.body })
                        .start(
                            { name: "tasks", schemaType: "task" },
                            async (err: Error, data: any, param: object): Promise<Response> => {
                                await dbm.disconnect().catch((err: Error) => {
                                    console.error(err);
                                });
                                if (err) {
                                    return res.json({
                                        action: err.name,
                                        response: { param, metadata: err.message },
                                        uptime: process.uptime(),
                                        responseTime: Utils.responseTime((<any>req).start),
                                        work: process.connected
                                    });
                                }

                                console.log("createTask done ");
                                return res.json({
                                    action: "done",
                                    response: { status: "OK", done: true, ...param },
                                    uptime: process.uptime(),
                                    responseTime: Utils.responseTime((<any>req).start),
                                    work: process.connected
                                });
                            }
                        );
                } else if (!res.headersSent) {
                    return res.json({
                        action: "error",
                        response: "Body empty",
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }
            } catch (err) {
                console.log(err.message);
                if (!res.headersSent) {
                    return res.json({
                        action: err.name,
                        response: "Server error",
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }
            }
        }
    }
}

export default Tasks;
