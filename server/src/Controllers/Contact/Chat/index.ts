import cluster from 'cluster';
import _ from 'lodash';
import { App } from '../../../Utils/Interfaces';
import { ParserResult, ResRequest } from "../../../Utils/Types";
import { NextFunction, Request, Response } from 'express';

import Decorators from "../../../Decorators";

import Utils from "../../../Utils";
import Action from "../../../Models/Action";
import WebSocketWorker from '../../../Models/WebSocketWorker';

namespace Chat {

    const Post = Decorators.Post;
    const Controller = Decorators.Controller;
    const { getResponseJson } = Utils;

    @Controller("/chat")
    export class ChatController {

        @Post({ path: "/loadChats", private: true, ws: true })
        async loadChats(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            const { body: { actionPath = "", actionType = "", queryParams = {} } = {} } = req;

            try {

                if (!actionPath || !actionType) {
                    throw new Error("Invalid action chat");
                }

                const actionTasks = new Action.ActionParser({ actionPath, actionType });
                const data: ParserResult = await actionTasks.getActionData(queryParams);

                if (!data) {
                    throw new TypeError("Bad action data");
                }

                return res.json(getResponseJson(
                    "done",
                    { params: { ...queryParams }, metadata: data, status: "done", done: true },
                    (req as Record<string, any>).start
                ));

            } catch (err) {
                console.error(err);
                res.sendStatus(503);
            }
        }
    }

    export const wsModule = (ws: WebSocketWorker) => {
        const workerId = cluster.worker.id;
        const worker = ws.getWorker(workerId);

        worker.on('connection', (socket: Socket) => {

            console.log("ws connection");
            socket.emit("connection", true);

            socket.on("newMessage", (msg, tokenRoom) => {
                worker.to(tokenRoom).emit("msg", msg);
            });

            socket.on("onChatRoomActive", ({ token: tokenRoom, displayName = "" }) => {
                socket.join(tokenRoom);
                worker.to(tokenRoom).emit("joinMsg", {
                    tokenRoom,
                    displayName: "System",
                });
            });

        });

        worker.on('disconnect', (socket: Socket) => {
            console.log(socket.eventNames);
            console.log('user disconnected');
        });
    };
}

export default Chat;