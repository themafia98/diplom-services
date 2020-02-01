import { Request, Response, NextFunction } from "express";
import { Document } from 'mongoose';
import _ from "lodash";
import Utils from "../../Utils";
import { App, Params, ResponseDocument } from "../../Utils/Interfaces";
import { ResRequest, docResponse } from "../../Utils/Types";

import Action from '../../Models/Action';
import Decorators from "../../Decorators";

namespace Tasks {
    const Controller = Decorators.Controller;
    const Get = Decorators.Get;
    const Post = Decorators.Post;

    @Controller("/tasks")
    export class TasksController {
        @Get({ path: "/list", private: true })
        public async getList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                const service = server.locals;
                const connect = await service.dbm.connection().catch((err: Error) => {
                    console.error(err);
                });


                if (!connect) throw new Error("Bad connect");

                const params: Params = { methodQuery: "get_all", status: "done", done: true, from: "tasks" };
                const actionTasks = new Action.ActionParser({ actionPath: "tasks", actionType: "get_all" });
                const data: Document[] | null = await actionTasks.getActionData({});

                if (!data) {
                    params.status = "error";

                    return res.json({
                        action: "error",
                        response: { param: params, metadata: data },
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }

                await service.dbm.disconnect().catch((err: Error) => console.error(err));

                let metadata: Array<any> = [];

                if (data && Array.isArray(data)) {
                    metadata = data.map((it: docResponse) => {

                        const item: ResponseDocument = it["_doc"] || it;

                        return Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
                            if (!key.includes("password") && !key.includes("At") && !key.includes("__v")) {
                                obj[key] = item[key];
                            }
                            return obj;
                        }, {});
                    }).filter(Boolean);
                }

                return res.json({
                    action: "done",
                    response: { param: params, metadata },
                    uptime: process.uptime(),
                    responseTime: Utils.responseTime((<any>req).start),
                    work: process.connected
                });

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
        public async create(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
                    const param = {};
                    const connect = await dbm.connection().catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const params: Params = { methodQuery: "get_all", status: "done", done: true, from: "users" };
                    const createTaskAction = new Action.ActionParser({ actionPath: "tasks", actionType: "set_single" });

                    const data: Document[] | null = await createTaskAction.getActionData(req.body);
                    console.log(data);

                    await dbm.disconnect().catch((err: Error) => console.error(err));

                    if (!data) {
                        params.status = "error";

                        return res.json({
                            action: "error set_single task",
                            response: { status: "FAIL", params, done: false, metadata: data },
                            uptime: process.uptime(),
                            responseTime: Utils.responseTime((<any>req).start),
                            work: process.connected
                        });
                    }

                    const meta = <ArrayLike<object>>Utils.parsePublicData(<any>[data]);

                    const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

                    return res.json({
                        action: "done",
                        response: { status: "OK", done: true, ...param, metadata },
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });

                } else if (!res.headersSent) {
                    return res.json({
                        action: "error",
                        response: { status: "FAIL", params: { body: req.body }, done: false, metadata: "Body empty" },
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
                        response: { status: "FAIL", done: false, metadata: "Server error" },
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }
            }
        }

        @Post({ path: "/update/description", private: true })
        public async editTask(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
                    const { idTask: id = null, description = "" } = req.body;
                    await dbm.connection().catch((err: Error) => console.error(err));
                    dbm.collection("tasks")
                        .update({
                            methodQuery: "update_single", body: {
                                updateField: { type: "description", description }, id
                            }
                        })
                        .start(
                            { name: "tasks", schemaType: "task" },
                            async (err: Error, data: any, param: object): Promise<Response> => {
                                await dbm.disconnect().catch((err: Error) => console.error(err));
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


        @Post({ path: "/update/single", private: true })
        public async updateStatus(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
                    const param = {};
                    const body: object = req.body;
                    const connect = await dbm.connection().catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const params: Params = { methodQuery: "update_status", status: "done", done: true, from: "tasks" };
                    const createTaskAction = new Action.ActionParser({ actionPath: "tasks", actionType: "update_single", body });

                    const data: Document[] | null = await createTaskAction.getActionData(req.body);

                    await dbm.disconnect().catch((err: Error) => console.error(err));

                    if (!data) {
                        params.status = "error";

                        return res.json({
                            action: "error set_single task",
                            response: { status: "FAIL", params, done: false, metadata: data },
                            uptime: process.uptime(),
                            responseTime: Utils.responseTime((<any>req).start),
                            work: process.connected
                        });
                    }

                    const meta = <ArrayLike<object>>Utils.parsePublicData(<any>[data]);

                    const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

                    return res.json({
                        action: "done",
                        response: { status: "OK", done: true, ...param, metadata },
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });

                } else if (!res.headersSent) {
                    return res.json({
                        action: "error",
                        response: { status: "FAIL", params: { body: req.body }, done: false, metadata: "Body empty" },
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
                        response: { status: "FAIL", done: false, metadata: "Server error" },
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
