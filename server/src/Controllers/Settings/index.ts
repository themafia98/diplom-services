import { NextFunction, Response, Request } from "express";
import _ from "lodash";
import { App, Params, ActionParams } from "../../Utils/Interfaces";
import { ParserResult, ResRequest, ParserData } from "../../Utils/Types";

import Utils from "../../Utils";
import Action from "../../Models/Action";
import Decorators from "../../Decorators";

namespace Settings {
    const { getResponseJson } = Utils;
    const { Controller, Post } = Decorators;

    @Controller("/settings")
    export class SettingsController {
        @Post({ path: "/password", private: true })
        public async passwordChaged(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const params: Params = { methodQuery: "change_password", from: "users", done: true, status: "OK" };
            try {
                const body: object = req.body;
                const queryParams: Record<string, any> = (<Record<string, any>>body).queryParams;

                if (!queryParams || _.isEmpty(queryParams)) {
                    throw new Error("Invalid queryParams for change action");
                }

                const changePasswordAction = new Action.ActionParser({
                    actionPath: "users",
                    actionType: "change_password",
                    body
                });

                const actionParams: ActionParams = { queryParams };
                const data: ParserResult = await changePasswordAction.getActionData(actionParams);

                if (!data) {
                    throw new Error("Invalid action data");
                }

                return res.sendStatus(200);

            } catch (err) {
                console.error(err);
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

export default Settings;
