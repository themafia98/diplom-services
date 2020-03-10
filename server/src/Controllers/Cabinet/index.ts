import { NextFunction, Response, Request } from "express";
import _ from "lodash";
import { App, Params, ActionParams } from "../../Utils/Interfaces";
import { ParserResult, ResRequest } from "../../Utils/Types";

import Utils from "../../Utils";
import Action from "../../Models/Action";
import Decorators from "../../Decorators";

namespace Cabinet {
    const { getResponseJson } = Utils;
    const { Controller, Post } = Decorators;

    @Controller("/cabinet")
    export class CabinetController {
        @Post({ path: "/validationAvatar", private: true })
        public async validationAvatar(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = {
                methodQuery: "update_avatar",
                from: "users",
                done: true,
                status: "OK"
            };

            try {

                return res.sendStatus(200);
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
