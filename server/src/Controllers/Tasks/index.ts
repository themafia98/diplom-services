import { Request, Response, NextFunction } from "express";
import { Document } from 'mongoose';
import _ from "lodash";
import Utils from "../../Utils";
import { App, Params, ResponseDocument } from "../../Utils/Interfaces";
import { ResRequest, docResponse, ParserResult } from "../../Utils/Types";

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
                const data: ParserResult = await actionTasks.getActionData({});

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
                    const param: object = req.body.param;

                    const connect = await dbm.connection().catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const params: Params = { methodQuery: "set_single", status: "done", done: true, from: "users" };
                    const createTaskAction = new Action.ActionParser({ actionPath: "tasks", actionType: "set_single" });

                    const data: ParserResult = await createTaskAction.getActionData(req.body);

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

        @Post({ path: "/caching/jurnal", private: true })
        public async setjurnalworks(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                const dbm = server.locals.dbm;

                const params: Params = {
                    methodQuery: "set_jurnal",
                    status: "done",
                    done: true,
                    from: "jurnalworks",
                }

                const failParams: Params = {
                    methodQuery: "set_jurnal",
                    status: "fail",
                    done: false,
                    from: "jurnalworks",
                }

                if (req.body && !_.isEmpty(req.body)) {
                    const param = {};
                    const body: object = req.body;
                    const connect = await dbm.connection().catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const createJurnalAction = new Action.ActionParser({
                        actionPath: "jurnalworks",
                        actionType: "set_jurnal",
                        body
                    });

                    const data: ParserResult = await createJurnalAction.getActionData(req.body);

                    await dbm.disconnect().catch((err: Error) => console.error(err));

                    if (!data) {
                        params.status = "error";

                        return res.json({
                            action: "error set_jurnal action",
                            response: {
                                status: "FAIL",
                                params: failParams,
                                done: false,
                                metadata: data
                            },
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
                        response: { status: "FAIL", params: failParams, done: false, metadata: null },
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
                        response: {
                            status: "FAIL",
                            failParams: {
                                status: "fail",
                                done: false
                            },
                            done: false,
                            metadata: "Server error"
                        },
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }
            }
        }

        @Post({ path: "/caching/list", private: true })
        public async getCachingList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                const service = server.locals;
                const connect = await service.dbm.connection().catch((err: Error) => {
                    console.error(err);
                });

                const { queryParams = {}, actionType = "" } = req.body;
                const { store = "" } = queryParams || {};

                if (!connect) throw new Error("Bad connect");

                const params: Params = { methodQuery: actionType, status: "done", done: true, from: "tasks" };
                const actionTasks = new Action.ActionParser({ actionPath: store, actionType: actionType });
                const data: ParserResult = await actionTasks.getActionData(queryParams);

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
        };


        @Post({ path: "/update/single", private: true })
        public async updateSingle(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                const dbm = server.locals.dbm;

                const params: Params = {
                    methodQuery: "update_single",
                    status: "done",
                    done: true,
                    from: "tasks"
                };

                const failParams: Params = {
                    methodQuery: "update_single",
                    status: "fail",
                    done: false,
                    from: "tasks"
                };

                if (req.body && !_.isEmpty(req.body)) {
                    const param = {};
                    const body: object = req.body;
                    const connect = await dbm.connection().catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const createTaskAction = new Action.ActionParser({
                        actionPath: "tasks",
                        actionType: "update_single",
                        body
                    });

                    const data: ParserResult = await createTaskAction.getActionData(req.body);

                    await dbm.disconnect().catch((err: Error) => console.error(err));

                    if (!data) {
                        params.status = "error";

                        return res.json({
                            action: "error set_single task",
                            response: {
                                status: "FAIL",
                                params: failParams,
                                done: false,
                                metadata: data
                            },
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
                        response: { status: "FAIL", params: failParams, done: false, metadata: null },
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
                        response: {
                            status: "FAIL",
                            failParams: {
                                status: "fail",
                                done: false
                            },
                            done: false,
                            metadata: "Server error"
                        },
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }
            }
        }

        @Post({ path: "/update/many", private: true })
        public async updateMany(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {
                const dbm = server.locals.dbm;

                const params: Params = {
                    methodQuery: "update_many",
                    status: "done",
                    done: true,
                    from: "tasks"
                };

                const failParams: Params = {
                    methodQuery: "update_many",
                    status: "fail",
                    done: false,
                    from: "tasks"
                };

                if (req.body && !_.isEmpty(req.body)) {
                    const param = {};
                    const body: object = req.body;
                    const connect = await dbm.connection().catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const createTaskAction = new Action.ActionParser({
                        actionPath: "tasks",
                        actionType: "update_many",
                        body
                    });

                    const data: ParserResult = await createTaskAction.getActionData(req.body);

                    await dbm.disconnect().catch((err: Error) => console.error(err));

                    if (!data) {
                        params.status = "error";

                        return res.json({
                            action: "error update_many task",
                            response: {
                                status: "FAIL",
                                params: failParams,
                                done: false,
                                metadata: data
                            },
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
                        response: { status: "FAIL", params: failParams, done: false, metadata: null },
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
                        response: {
                            status: "FAIL",
                            failParams: {
                                status: "fail",
                                done: false
                            },
                            done: false,
                            metadata: "Server error"
                        },
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
