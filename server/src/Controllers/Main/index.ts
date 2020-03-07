import { NextFunction, Response, Request } from "express";
import _ from "lodash";
import { Document } from "mongoose";
import { App, Params, FileApi } from "../../Utils/Interfaces";
import { ParserResult, ResRequest } from "../../Utils/Types";
import Utils from "../../Utils";
import Decorators from "../../Decorators";
import Action from "../../Models/Action";

namespace System {
    const { getResponseJson } = Utils;
    const Controller = Decorators.Controller;
    const Delete = Decorators.Delete;
    const Post = Decorators.Post;
    const Get = Decorators.Get;
    @Controller("/system")
    export class SystemData {
        @Get({ path: "/userList", private: true })
        async getUsersList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "get_all", status: "done", done: true, from: "users" };
            try {
                const service = server.locals;
                const connect = await service.dbm.connection().catch((err: Error) => console.error(err));

                if (!connect) throw new Error("Bad connect");

                const actionUserList = new Action.ActionParser({ actionPath: "users", actionType: "get_all" });
                const data: ParserResult = await actionUserList.getActionData({});

                await service.dbm.disconnect().catch((err: Error) => console.error(err));

                if (!data) {
                    params.status = "error";
                    params.done = false;
                    res.status(404);
                    return res.json(
                        getResponseJson(
                            "error",
                            { status: "FAIL", params, done: false, metadata: data },
                            (req as Record<string, any>).start
                        ));
                }

                const metadata: ArrayLike<object> = Utils.parsePublicData(data);

                return res.json(
                    getResponseJson(
                        "done",
                        { status: "OK", done: true, params, metadata },
                        (req as Record<string, any>).start
                    ));
            } catch (err) {
                console.error(err);
                await server.locals.service.dbm.disconnect().catch((err: Error) => console.error(err));

                if (!res.headersSent) {
                    params.done = false;
                    params.status = "FAIL";
                    res.status(503);
                    return res.json(
                        getResponseJson(
                            err.name,
                            { status: "Server error", done: false, params, metadata: null },
                            (req as Record<string, any>).start
                        ));
                }
            }
        }

        @Post({ path: "/:module/file", private: true, file: true })
        public async saveFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { module: moduleName = "" } = req.params;
            const params: Params = { methodQuery: "save_file", status: "done", done: true, from: moduleName };

            try {
                const files = Array.isArray(req.files) ? req.files : null;

                if (files) {
                    const store: FileApi = server.locals.dropbox;
                    let responseSave: Array<object | null> = [];

                    for await (let file of files) {
                        const [filename, entityId] = file.fieldname.split("__");
                        const parseOriginalName = file.originalname.split(/\./gi);
                        const ext = parseOriginalName[parseOriginalName.length - 1];

                        const path: string = `/${moduleName}/${entityId}/${file.originalname}`;
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
                                (req as Record<string, any>).start
                            )
                        );
                    else throw new Error(`fail save files in ${moduleName}`);
                } else {
                    params.done = false;
                    return res.json(
                        getResponseJson(
                            "error action save_file task",
                            { status: "FAIL", params, done: false, metadata: [] },
                            (req as Record<string, any>).start
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
                            (req as Record<string, any>).start
                        )
                    );
                }
            }
        }

        @Post({ path: "/:module/load/file", private: true })
        public async loadTaskFiles(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { module: moduleName = "" } = req.params;
            const params: Params = { methodQuery: "load_files", status: "done", done: true, from: moduleName };

            try {
                const downloadAction = new Action.ActionParser({
                    actionPath: "global",
                    actionType: "load_files",
                    store: <FileApi>server.locals.dropbox
                });

                const actionData: ParserResult = await downloadAction.getActionData({ body: req.body, moduleName });

                if (!actionData) {
                    params.done = false;
                    return res.json(
                        getResponseJson(
                            `error action load_files ${moduleName}`,
                            { status: "FAIL", params, done: false, metadata: [] },
                            (req as Record<string, any>).start
                        )
                    );
                } else {
                    return res.json(
                        getResponseJson(
                            "done",
                            { status: "OK", done: true, params, metadata: (<Document[]>actionData).entries },
                            (req as Record<string, any>).start
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
                            (req as Record<string, any>).start
                        )
                    );
            }
        }

        @Get({ path: "/:module/download/:entityId/:filename", private: true })
        public async downloadFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { entityId = "", filename = "", module: moduleName = "" } = req.params;
            const params: Params = { methodQuery: "download_files", status: "done", done: true, from: "tasks" };

            if (entityId && filename) {
                try {
                    const dropbox: FileApi = server.locals.dropbox;
                    const downloadAction = new Action.ActionParser({
                        actionPath: "global",
                        actionType: "download_files",
                        store: dropbox
                    });

                    const actionData: ParserResult = await downloadAction.getActionData({
                        entityId,
                        moduleName,
                        filename
                    });

                    const isBinary: Boolean = actionData && (actionData as Record<string, any>).fileBinary;
                    const fileBinary: BinaryType = isBinary ? (actionData as Record<string, any>).fileBinary : null;

                    if (!actionData) {
                        params.done = false;
                        return res.json(
                            getResponseJson(
                                `download_files fail in ${moduleName}`,
                                { status: "FAIL", params, done: true, metadata: fileBinary },
                                (req as Record<string, any>).start
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
                                (req as Record<string, any>).start
                            )
                        );
                }
            } else return res.sendStatus(404);
        }

        @Delete({ path: "/:module/delete/file", private: true })
        public async deleteTaskFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { module: moduleName = "" } = req.params;
            const params: Params = { methodQuery: "delete_file", status: "done", done: true, from: moduleName };

            try {
                const deleteFileAction = new Action.ActionParser({
                    actionPath: "global",
                    actionType: "delete_file",
                    store: <FileApi>server.locals.dropbox
                });

                const actionData: ParserResult = await deleteFileAction.getActionData({
                    body: { ...req.body },
                    store: `/${moduleName}`
                });

                if (!actionData) {
                    params.done = false;
                    return res.json(
                        getResponseJson(
                            "error action delete_file task",
                            { status: "FAIL", params, done: false, metadata: [] },
                            (req as Record<string, any>).start
                        )
                    );
                } else {
                    return res.json(
                        getResponseJson(
                            "done",
                            {
                                status: "OK",
                                done: true,
                                params,
                                metadata: (actionData as Record<string, any>).metadata
                            },
                            (req as Record<string, any>).start
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
                            (req as Record<string, any>).start
                        )
                    );
            }
        }

        @Post({ path: "/:module/update/single", private: true })
        public async updateSingle(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { module: moduleName = "" } = req.params;
            const body: object = req.body;
            const params: Params = { methodQuery: "update_single", status: "done", done: true, from: moduleName };
            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
                    const connect = await dbm.connection()
                        .catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const createTaskAction = new Action.ActionParser({
                        actionPath: moduleName,
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
                                `error set_single ${moduleName}`,
                                { status: "FAIL", params: { body, ...params }, done: false, metadata: data },
                                (req as Record<string, any>).start
                            )
                        );
                    }

                    const meta = <ArrayLike<object>>Utils.parsePublicData(<ParserResult>[data]);
                    const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

                    return res.json(
                        getResponseJson(
                            "done",
                            { status: "OK", done: true, params: { body, ...params }, metadata },
                            (req as Record<string, any>).start
                        )
                    );
                } else if (!res.headersSent) {
                    params.done = false;
                    params.status = "FAIL";
                    return res.json(
                        getResponseJson(
                            "error",
                            { status: "FAIL", params: { body, ...params }, done: false, metadata: null },
                            (req as Record<string, any>).start
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
                            (req as Record<string, any>).start
                        )
                    );
                }
            }
        }

        @Post({ path: "/:module/update/many", private: true })
        public async updateMany(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { module: moduleName = "" } = req.params;
            const params: Params = { methodQuery: "update_many", status: "done", done: true, from: moduleName };

            try {
                const dbm = server.locals.dbm;

                if (req.body && !_.isEmpty(req.body)) {
                    const body: object = req.body;
                    const connect = await dbm.connection().catch((err: Error) => console.error(err));

                    if (!connect) throw new Error("Bad connect");

                    const createTaskAction = new Action.ActionParser({
                        actionPath: moduleName,
                        actionType: "update_many",
                        body
                    });

                    const data: ParserResult = await createTaskAction.getActionData(req.body);

                    if (!data) {
                        params.status = "error";

                        return res.json(
                            getResponseJson(
                                `error update_many ${moduleName}`,
                                { status: "FAIL", params, done: false, metadata: data },
                                (req as Record<string, any>).start
                            )
                        );
                    }

                    const meta = <ArrayLike<object>>Utils.parsePublicData(<ParserResult>[data]);

                    const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

                    return res.json(
                        getResponseJson(
                            "done",
                            { status: "OK", done: true, params, metadata },
                            (req as Record<string, any>).start
                        )
                    );
                } else if (!res.headersSent) {
                    params.done = false;
                    params.status = "FAIL";
                    return res.json(
                        getResponseJson(
                            "error",
                            { status: "FAIL", params, done: false, metadata: null },
                            (req as Record<string, any>).start
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
                            (req as Record<string, any>).start
                        )
                    );
                }
            }
        }
    }
}

export default System;
