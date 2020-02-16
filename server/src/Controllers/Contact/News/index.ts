import { NextFunction, Response, Request } from "express";
import { App, Params, FileApi } from "../../../Utils/Interfaces";
import { ParserResult, Decorator, ResRequest } from '../../../Utils/Types';
import Utils from "../../../Utils";
import Decorators from "../../../Decorators";
import Action from "../../../Models/Action";

namespace News {
    const Controller = Decorators.Controller;
    const Post = Decorators.Post;
    const Get = Decorators.Get;

    @Controller("/news")
    export class NewsController {

        @Get({ path: "/list", private: true })
        public async getNewsList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            try {

                const service = server.locals;
                const connect = await service.dbm.connection().catch((err: Error) => {
                    console.error(err);
                });

                const params: Params = { methodQuery: "get_all", status: "done", done: true, from: "news" };

                if (!connect) throw new Error("Bad connect");

                const actionNews = new Action.ActionParser({ actionPath: "news", actionType: "get_all" });
                const data: Readonly<ParserResult> = await actionNews.getActionData({});

                if (!data) {
                    params.status = "error";

                    return res.json({
                        action: "error",
                        response: { param: params, metadata: [] },
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((req as Record<string, any>).start),
                        work: process.connected
                    });
                }

                await service.dbm.disconnect().catch((err: Error) => console.error(err));

                return res.json({
                    action: "done",
                    response: { param: params, metadata: data },
                    uptime: process.uptime(),
                    responseTime: Utils.responseTime((req as Record<string, any>).start),
                    work: process.connected
                });

            } catch (err) {
                console.error(err);
                if (!res.headersSent) {
                    return res.json({
                        action: err.name,
                        response: "Server error",
                        uptime: process.uptime(),
                        responseTime: Utils.responseTime((req as Record<string, any>).start),
                        work: process.connected
                    });
                }
            }

        }
    };
};

export default News;