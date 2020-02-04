import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { files } from "dropbox";
import uuid from "uuid/v4";
import { Document } from "mongoose";
import _ from "lodash";
import Utils from "../../Utils";
import { App, Params, ResponseDocument, DropboxApi, ActionProps } from "../../Utils/Interfaces";
import { ResRequest, docResponse, ParserResult } from "../../Utils/Types";

import Action from "../../Models/Action";
import Decorators from "../../Decorators";

namespace Tasks {
    const { getResponseJson } = <any>Utils;
    const Controller = Decorators.Controller;
    const Get = Decorators.Get;
    const Delete = Decorators.Delete;
    const Post = Decorators.Post;

    @Controller("/tasks")
    export class TasksController {
        @Get({ path: "/list", private: true })
        public async getList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "get_all", status: "done", done: true, from: "tasks" };
            try {
                const service = server.locals;
                const connect = await service.dbm.connection().catch((err: Error) => {
                    console.error(err);
                });

                if (!connect) throw new Error("Bad connect");

                const actionTasks = new Action.ActionParser({ actionPath: "tasks", actionType: "get_all" });
                const data: ParserResult = await actionTasks.getActionData({});

                if (!data) {
                    params.status = "error";

                    return res.json(
                        getResponseJson("error", { params, metadata: data, status: "FAIL", done: false }, (<any>req).start)
                    );
                }

                await service.dbm.disconnect().catch((err: Error) => console.error(err));

                let metadata: Array<any> = [];

                if (data && Array.isArray(data)) {
                    metadata = data
                        .map((it: docResponse) => {
                            const item: ResponseDocument = it["_doc"] || it;

                            return Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
                                if (!key.includes("password") && !key.includes("At") && !key.includes("__v")) {
                                    obj[key] = item[key];
                                }
                                return obj;
                            }, {});
                        })
                        .filter(Boolean);
                }

                return res.json(getResponseJson("done", { params, metadata, done: true, status: "OK" }, (<any>req).start));
            } catch (err) {
                console.error(err);
                if (!res.headersSent) {
                    return res.json(
                        getResponseJson(
                            err.name,
                            { metadata: "Server error", params, done: false, status: "FAIL" },
                            (<any>req).start
                        )
                    );
                }
            }
        }

        @Get({ path: "/download/:taskId/:filename", private: true })
        public async downloadFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {

            const { taskId = "", filename = "" } = req.params;
            const params: Params = { methodQuery: "download_files", status: "done", done: true, from: "tasks" };

            if (taskId && filename) {
                try {

                    const dropbox: DropboxApi = server.locals.dropbox;
                    const downloadAction = new Action.ActionParser({
                        actionPath: "global",
                        actionType: "download_files",
                        store: dropbox
                    });

                    const actionData: ParserResult = await downloadAction.getActionData({
                        taskId, filename
                    });

                    const isBinary: Boolean = actionData && (<any>actionData).fileBinary;
                    const fileBinary: BinaryType | null = isBinary ? (<any>actionData).fileBinary : null;

                    if (!actionData) {
                        params.done = false;
                        return res.json(
                            getResponseJson(
                                "download_files fail",
                                { status: "FAIL", params, done: true, metadata: fileBinary },
                                (<any>req).start
                            )
                        );
                    } else if (fileBinary) {
                        return res.send(Buffer.from(fileBinary));
                    }
                } catch (err) {
                    console.error(err);
                    params.done = false;
                    if (!res.headersSent)
                        return res.json(
                            getResponseJson(
                                err.name,
                                { status: "FAIL", params, done: false, metadata: "Server error" },
                                (<any>req).start
                            )
                        );
                }
            } else return res.sendStatus(404);
        }

        @Delete({ path: "/delete/file", private: true })
        public async deleteTaskFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "delete_file", status: "done", done: true, from: "tasks" };

            try {
                const deleteFileAction = new Action.ActionParser({
                    actionPath: "global",
                    actionType: "delete_file",
                    store: <DropboxApi>server.locals.dropbox
                });

                const actionData: ParserResult = await deleteFileAction.getActionData({ ...req.body, store: "/tasks" });

                if (!actionData) {
                    params.done = false;
                    return res.json(
                        getResponseJson(
                            "error action delete_file task",
                            { status: "FAIL", params, done: false, metadata: [] },
                            (<any>req).start
                        )
                    );
                } else {
                    return res.json(
                        getResponseJson(
                            "done",
                            { status: "OK", done: true, params, metadata: (<Document[]>actionData).entries },
                            (<any>req).start
                        )
                    );
                }
            } catch (err) {
                params.done = false;
                console.error(err);
                if (!res.headersSent)
                    return res.json(
                        getResponseJson(
                            err.name,
                            { status: "FAIL", params, done: false, metadata: "Server error" },
                            (<any>req).start
                        )
                    );
            }
        }

        @Post({ path: "/load/file", private: true })
        public async loadTaskFiles(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "load_files", status: "done", done: true, from: "tasks" };

            try {
                const downloadAction = new Action.ActionParser({
                    actionPath: "global",
                    actionType: "load_files",
                    store: <DropboxApi>server.locals.dropbox
                });


                const actionData: ParserResult = await downloadAction.getActionData(req.body);

                if (!actionData) {
                    params.done = false;
                    return res.json(
                        getResponseJson(
                            "error action load_files task",
                            { status: "FAIL", params, done: false, metadata: [] },
                            (<any>req).start
                        )
                    );
                } else {
                    return res.json(
                        getResponseJson(
                            "done",
                            { status: "OK", done: true, params, metadata: (<Document[]>actionData).entries },
                            (<any>req).start
                        )
                    );
                }
            } catch (err) {
                params.done = false;
                console.error(err);
                if (!res.headersSent)
                    return res.json(
                        getResponseJson(
                            err.name,
                            { status: "FAIL", params, done: false, metadata: "Server error" },
                            (<any>req).start
                        )
                    );
            }
        }

        @Post({ path: "/file", private: true, file: true })
        public async saveFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "save_file", status: "done", done: true, from: "tasks" };

            try {
                const files = Array.isArray(req.files) ? req.files : null;

                if (files) {
                    const store: DropboxApi = server.locals.dropbox;
                    let responseSave: Array<object | null> = [];

                    for await (let file of files) {
                        const [filename, taskId] = file.fieldname.split("__");
                        const parseOriginalName = file.originalname.split(/\./gi);
                        const ext = parseOriginalName[parseOriginalName.length - 1];

                        const path: string = `/tasks/${taskId}/${uuid()}.${ext}`;
                        const result = await store.saveFile({ path, contents: file.buffer });

                        if (result) {
                            responseSave.push({
                                name: result.name,
                                isSave: true
                            });
                        } else {
                            responseSave.push({
                                name: `${filename}.${ext}`,
                                isSave: false
                            });
                        }
                    }

                    responseSave = responseSave.filter(Boolean);

                    if (responseSave.length)
                        return res.json(
                            getResponseJson(
                                "done",
                                { status: "OK", done: true, params, metadata: responseSave },
                                (<any>req).start
                            )
                        );
                    else throw new Error("fail save files");
                } else {
                    params.done = false;
                    return res.json(
                        getResponseJson(
                            "error action save_file task",
                            { status: "FAIL", params, done: false, metadata: [] },
                            (<any>req).start
                        )
                    );
                }
            } catch (err) {
                params.done = false;
                console.log(err.message);
                if (!res.headersSent) {
                    return res.json(
                        getResponseJson(
                            err.name,
                            { status: "FAIL", done: false, params, metadata: "Server error" },
                            (<any>req).start
                        )
                    );
                }
            }
        }

        @Post({ path: "/createTask", private: true })
        public async create(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "set_single", status: "done", done: true, from: "users" };
            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
                    const param: object = req.body.param;

                    const connect = await dbm.connection().catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const createTaskAction = new Action.ActionParser({ actionPath: "tasks", actionType: "set_single" });

                    const data: ParserResult = await createTaskAction.getActionData(req.body);

                    await dbm.disconnect().catch((err: Error) => console.error(err));

                    if (!data) {
                        params.status = "error";

                        return res.json(
                            getResponseJson(
                                "error set_single task",
                                { status: "FAIL", params, done: false, metadata: data },
                                (<any>req).start
                            )
                        );
                    }

                    const meta = <ArrayLike<object>>Utils.parsePublicData(<any>[data]);

                    const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

                    return res.json(getResponseJson("done", { status: "OK", done: true, params, metadata }, (<any>req).start));
                } else if (!res.headersSent) {
                    return res.json(
                        getResponseJson(
                            "error",
                            {
                                status: "FAIL",
                                params: { body: req.body, ...params },
                                done: false,
                                metadata: "Body empty"
                            },
                            (<any>req).start
                        )
                    );
                }
            } catch (err) {
                console.log(err.message);
                if (!res.headersSent) {
                    return res.json(
                        getResponseJson(
                            err.name,
                            { status: "FAIL", params, done: false, metadata: "Server error" },
                            (<any>req).start
                        )
                    );
                }
            }
        }

        @Post({ path: "/caching/jurnal", private: true })
        public async setJurnalWorks(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "set_jurnal", status: "done", done: true, from: "jurnalworks" };
            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
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
                        params.done = false;

                        return res.json(getResponseJson(
                            "error set_jurnal action",
                            { status: "FAIL", params, done: false, metadata: data },
                            (<any>req).start
                        ));
                    }

                    const meta = <ArrayLike<object>>Utils.parsePublicData(<any>[data]);
                    const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

                    return res.json(getResponseJson("done", { status: "OK", done: true, params, metadata }, (<any>req).start));
                } else if (!res.headersSent) {
                    return res.json(
                        getResponseJson("error", { status: "FAIL", params, done: false, metadata: null }, (<any>req).start)
                    );
                }
            } catch (err) {
                console.log(err.message);
                if (!res.headersSent) {
                    return res.json(
                        getResponseJson(
                            err.name,
                            { status: "FAIL", params, done: false, metadata: "Server error" },
                            (<any>req).start
                        )
                    );
                }
            }
        }

        @Post({ path: "/caching/list", private: true })
        public async getCachingList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { queryParams = {}, actionType = "" } = req.body;
            const params: Params = { methodQuery: actionType, status: "done", done: true, from: "tasks" };
            try {
                const service = server.locals;
                const connect = await service.dbm.connection().catch((err: Error) => {
                    console.error(err);
                });

                const { store = "" } = queryParams || {};

                if (!connect) throw new Error("Bad connect");

                const actionTasks = new Action.ActionParser({ actionPath: store, actionType: actionType });
                const data: ParserResult = await actionTasks.getActionData(queryParams);

                if (!data) {
                    params.status = "error";

                    return res.json(
                        getResponseJson("error", { params, status: "FAIL", done: false, metadata: data }, (<any>req).start)
                    );
                }

                await service.dbm.disconnect().catch((err: Error) => console.error(err));

                let metadata: Array<any> = [];

                if (data && Array.isArray(data)) {
                    metadata = data
                        .map((it: docResponse) => {
                            const item: ResponseDocument = it["_doc"] || it;

                            return Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
                                if (!key.includes("password") && !key.includes("At") && !key.includes("__v")) {
                                    obj[key] = item[key];
                                }
                                return obj;
                            }, {});
                        })
                        .filter(Boolean);
                }

                return res.json(getResponseJson("done", { params, metadata, status: "OK", done: true }, (<any>req).start));
            } catch (err) {
                params.done = false;
                console.error(err);
                if (!res.headersSent) {
                    return res.json(
                        getResponseJson(
                            err.name,
                            { metadata: "Server error", status: "FAIL", done: false, params },
                            (<any>req).start
                        )
                    );
                }
            }
        }

        @Post({ path: "/update/single", private: true })
        public async updateSingle(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const body: object = req.body;
            const params: Params = { methodQuery: "update_single", status: "done", done: true, from: "tasks" };
            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
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
                        params.done = false;
                        return res.json(
                            getResponseJson(
                                "error set_single task",
                                { status: "FAIL", params: { body, ...params }, done: false, metadata: data },
                                (<any>req).start
                            )
                        );
                    }

                    const meta = <ArrayLike<object>>Utils.parsePublicData(<any>[data]);
                    const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

                    return res.json(
                        getResponseJson(
                            "done",
                            { status: "OK", done: true, params: { body, ...params }, metadata },
                            (<any>req).start
                        )
                    );
                } else if (!res.headersSent) {
                    params.done = false;
                    params.status = "FAIL";
                    return res.json(
                        getResponseJson(
                            "error",
                            { status: "FAIL", params: { body, ...params }, done: false, metadata: null },
                            (<any>req).start
                        )
                    );
                }
            } catch (err) {
                console.log(err.message);
                if (!res.headersSent) {
                    return res.json(
                        getResponseJson(
                            err.name,
                            { status: "FAIL", params, done: false, metadata: "Server error" },
                            (<any>req).start
                        )
                    );
                }
            }
        }

        @Post({ path: "/update/many", private: true })
        public async updateMany(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "update_many", status: "done", done: true, from: "tasks" };

            try {
                const dbm = server.locals.dbm;

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

                        return res.json(
                            getResponseJson(
                                "error update_many task",
                                { status: "FAIL", params, done: false, metadata: data },
                                (<any>req).start
                            )
                        );
                    }

                    const meta = <ArrayLike<object>>Utils.parsePublicData(<any>[data]);

                    const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

                    return res.json(getResponseJson("done", { status: "OK", done: true, params, metadata }, (<any>req).start));
                } else if (!res.headersSent) {
                    params.done = false;
                    params.status = "FAIL";
                    return res.json(
                        getResponseJson("error", { status: "FAIL", params, done: false, metadata: null }, (<any>req).start)
                    );
                }
            } catch (err) {
                console.log(err.message);
                if (!res.headersSent) {
                    return res.json(
                        getResponseJson(
                            err.name,
                            { status: "FAIL", params, done: false, metadata: "Server error" },
                            (<any>req).start
                        )
                    );
                }
            }
        }
    }
}

export default Tasks;
