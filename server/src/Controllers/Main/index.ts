import { NextFunction, Response, Request } from "express";
import { App, Params } from "../../Utils/Interfaces";
import { ParserResult } from '../../Utils/Types';
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
                const connect = await service.dbm.connection().catch((err: Error) => console.error(err));

                if (!connect) throw new Error("Bad connect");

                const params: Params = { methodQuery: "get_all", status: "done", done: true, from: "users" };
                const actionUserList = new Action.ActionParser({ actionPath: "users", actionType: "get_all" });

                const data: ParserResult = await actionUserList.getActionData({});

                await service.dbm.disconnect().catch((err: Error) => console.error(err));

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

                const metadata: ArrayLike<object> = Utils.parsePublicData(data);

                return res.json({
                    action: "done",
                    response: { param: params, metadata },
                    uptime: process.uptime(),
                    responseTime: Utils.responseTime((<any>req).start),
                    work: process.connected
                });

            } catch (err) {
                console.error(err);
                await server.locals.service.dbm.disconnect()
                    .catch((err: Error) => console.error(err));

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
