import _ from 'lodash';
import { App } from '../../../Utils/Interfaces';
import { ParserResult, ResRequest } from "../../../Utils/Types";
import { NextFunction, Request, Response } from 'express';

import Decorators from "../../../Decorators";
import Utils from "../../../Utils";
import Action from "../../../Models/Action";

"use strict";

namespace Chat {

    const Post = Decorators.Post;
    const Put = Decorators.Put;
    const Controller = Decorators.Controller;
    const { getResponseJson } = Utils;

    @Controller("/chat")
    export class ChatController {

        @Post({ path: "/loadChats", private: true, ws: true })
        public async loadChats(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { body: { actionPath = "", actionType = "", queryParams = {} } = {} } = req;

            try {

                if (!actionPath || !actionType) {
                    throw new Error("Invalid action chat");
                }

                const actionLoadChats = new Action.ActionParser({ actionPath, actionType });
                const data: ParserResult = await actionLoadChats.getActionData(queryParams);

                if (!data) {
                    throw new TypeError("Bad action data");
                }

                const filterData: object[] | object = Array.isArray(data) ? data.map(it => {
                    const item = it ? { ...(it as Record<string, any>)._doc } : {};
                    if (item && !_.isUndefined((item as Record<string, any>).__v)) {
                        delete item.__v;
                        return item;
                    }
                    return item;
                }) : Object.keys(data).reduce((filteredData, key) => {

                    if (key !== "__v") {
                        (filteredData as Record<string, any>)[key] = (data as Record<string, any>)[key];
                        return filteredData;
                    }

                    return filteredData;
                }, {});

                return res.json(
                    getResponseJson(
                        "done",
                        { params: { ...queryParams }, metadata: filterData, status: "done", done: true },
                        (req as Record<string, any>).start
                    ));

            } catch (err) {
                console.error(err);
                if (!res.headersSent) res.sendStatus(503);
            }
        }

        @Put({ path: "/createRoom", private: true })
        public async createRoom(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { body: { actionPath = "", actionType = "", queryParams = {} } = {} } = req;

            try {

                if (!actionPath || !actionType) {
                    throw new Error("Invalid action chat");
                }

                const actionCreateRoom = new Action.ActionParser({ actionPath, actionType });
                const data: ParserResult = await actionCreateRoom.getActionData(queryParams);

                if (!data) {
                    throw new TypeError("Bad action data");
                }

                return res.json(
                    getResponseJson(
                        "done",
                        { params: { ...queryParams }, metadata: data, status: "done", done: true },
                        (req as Record<string, any>).start
                    ));

            } catch (err) {
                console.error(err);
                if (!res.headersSent) res.sendStatus(503);
            }
        }

        @Post({ path: "/load/tokenData", private: true })
        async loadTokenData(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { body: { queryParams = {} } = {} } = req;
            const actionType: string = "get_msg_by_token";
            const actionPath: string = "chatMsg";
            try {
                console.log(queryParams);
                if (!actionPath || !actionType) {
                    throw new Error("Invalid action chat");
                }

                const actionCreateRoom = new Action.ActionParser({ actionPath, actionType });
                const data: ParserResult = await actionCreateRoom.getActionData(queryParams);

                if (!data) {
                    throw new TypeError("Bad action data");
                }

                return res.json(
                    getResponseJson(
                        "done",
                        { params: { ...queryParams }, metadata: data, status: "done", done: true },
                        (req as Record<string, any>).start
                    ));

            } catch (err) {
                console.error(err);
                if (!res.headersSent) res.sendStatus(503);
            }
        }
    }
}

export default Chat;