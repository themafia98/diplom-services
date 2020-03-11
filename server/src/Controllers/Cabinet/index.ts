import { NextFunction, Response, Request } from "express";
import _ from "lodash";
import { App, Params, ActionParams } from "../../Utils/Interfaces";
import { ParserResult, ResRequest } from "../../Utils/Types";

import Utils from "../../Utils";
import Action from "../../Models/Action";
import Decorators from "../../Decorators";

namespace Cabinet {
    const { getResponseJson, isImage } = Utils;
    const { Controller, Post } = Decorators;

    @Controller("/cabinet")
    export class CabinetController {
        @Post({ path: "/loadAvatar", private: true, file: true })
        public async validationAvatar(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { files = [] } = req;

            const image = (<Record<string, any>>files)[0] || null;

            if (!image || !image?.buffer) {
                throw new Error("Bad avatar");
            }

            const dataUrl = image.buffer.toString("base64");

            if (!dataUrl) {
                throw new Error("Bad convert to base64");
            }


            const params: Params = {
                methodQuery: "update_avatar",
                from: "users",
                done: true,
                status: "OK"
            };

            try {

                res.status(200);
                return res.json(
                    getResponseJson(
                        "update_avatar",
                        { params, metadata: dataUrl, done: true, status: "OK" },
                        (<Record<string, any>>req).start
                    )
                )
            } catch (error) {
                console.error(error);
                if (!res.headersSent) {
                    res.status(503);
                    return res.json(
                        getResponseJson(
                            "Server error",
                            { params, status: "FAIL", done: false, metadata: [] },
                            (<Record<string, any>>req).start
                        )
                    )
                }
            }
        }
    }

}

export default Cabinet;
