import { NextFunction, Response, Request, response } from "express";
import { Document } from 'mongoose';
import { App, ResponseDocument } from "../../Utils/Interfaces";
import { docResponse } from '../../Utils/Types';
import Utils from "../../Utils";
import Decorators from "../../Decorators";
import Action from "../../Models/Action";

namespace System {
    const Controller = Decorators.Controller;
    const Post = Decorators.Post;
    const Get = Decorators.Get;
    @Controller("/system")
    export class SystemData {
        @Get({ path: "/userList", private: true })
        async getUsersList(req: Request, res: Response, next: NextFunction, server: App): Promise<Response | void> {
            try {
                const service = server.locals;
                const connect = await service.dbm.connection();

                if (!connect) throw new Error("Bad connect");

                const actionUserList = new Action.ActionParser({ actionPath: "users", actionType: "get_all" });

                const data: Document[] | null = await actionUserList.getActionData({});
                console.log(data);

                await service.dbm.disconnect().catch((err: Error) => console.error(err));

                if (!data) {
                    return res.json({
                        action: "error",
                        response: { param: {}, metadata: data },
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }

                let metadata: Array<any> = [];

                if (data && Array.isArray(data)) {
                    metadata = data.map((it: docResponse) => {

                        const item: ResponseDocument = it.doc || it;

                        return Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
                            if (!key.includes("password") && !key.includes("At") && !key.includes("__v")) {
                                obj[key] = item[key];
                            }
                            return obj;
                        }, {});
                    });

                }

                return res.json({
                    action: "done",
                    response: { param: {}, metadata },
                    uptime: process.uptime(),
                    responseTime: Utils.responseTime((<any>req).start),
                    work: process.connected
                });

            } catch (err) {
                console.error(err);
                if (!res.headersSent) {
                    return res.json({
                        action: err.name,
                        response: null,
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((<any>req).start),
                        work: process.connected
                    });
                }
            }
        }
    }
}

export default System;
