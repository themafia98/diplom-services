import { NextFunction, Response, Request } from "express";
import { App, Metadata, MetadataMongo, ResponseMetadata } from "../../Utils/Interfaces";
import Utils from "../../Utils";
import Decorators from "../../Decorators";

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
                await service.dbm.connection();
                service.dbm
                    .collection("users")
                    .get({ methodQuery: "all" })
                    .start(
                        { name: "users", schemaType: "users" },
                        async (err: Error, data: Metadata, param: Object): Promise<Response> => {
                            const dataCopy: Metadata = <Metadata>{ ...data } || {};
                            await service.dbm.disconnect();
                            if (err) {
                                return res.json({
                                    action: err.name,
                                    response: { param, metadata: err.message },
                                    uptime: process.uptime(),
                                    responseTime: Utils.responseTime((<any>req).start),
                                    work: process.connected
                                });
                            }

                            if (dataCopy.GET && dataCopy.GET.metadata && Array.isArray(dataCopy.GET.metadata)) {
                                const metadata: Array<Metadata> = dataCopy.GET.metadata;
                                dataCopy.GET.metadata = metadata.map((it: MetadataMongo) => {
                                    const item: ResponseMetadata = it["_doc"] || it;
                                    return Object.keys(item).reduce((obj: ResponseMetadata, key: string): object => {
                                        if (!key.includes("password") && !key.includes("At") && !key.includes("__v")) {
                                            obj[key] = item[key];
                                        }
                                        return obj;
                                    }, {});
                                });
                            }

                            return res.json({
                                action: "done",
                                response: { param, ...dataCopy },
                                uptime: process.uptime(),
                                responseTime: Utils.responseTime((<any>req).start),
                                work: process.connected
                            });
                        }
                    );
            } catch (err) {
                console.error(err);
            }
        }
    }
}

export default System;
