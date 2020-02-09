import _ from 'lodash';
import { App } from '../../../Utils/Interfaces';
import { ParserResult, ResRequest } from "../../../Utils/Types";
import { NextFunction, Request, Response } from 'express';

import Decorators from "../../../Decorators";
import Utils from "../../../Utils";
import Action from "../../../Models/Action";

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
    }
}

export default Chat;