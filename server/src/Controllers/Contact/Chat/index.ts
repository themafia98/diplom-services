import cluster from 'cluster';
import socketio, { Socket } from 'socket.io';
import { App } from '../../../Utils/Interfaces';
import Entrypoint from '../../../';
import { ParserResult, ResRequest } from "../../../Utils/Types";
import { NextFunction, Request, Response } from 'express';

import Utils from "../../../Utils";
import Action from "../../../Models/Action";
import { isObject } from 'util';
namespace Chat {
    export const module = (app: App, server: any): null | void => {
        if (!app) return null;


        const { getResponseJson } = Utils;

        app.post("/chat/loadChats", async (req: Request, res: Response, next: NextFunction): ResRequest => {
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
                    (<any>req).start
                ));

            } catch (err) {
                console.error(err);
                res.sendStatus(503);
            }
        });

        const { wsWorkers = [] } = Entrypoint || {};
        const workerId = cluster.worker.id;

        wsWorkers[workerId] = socketio(server);

        wsWorkers[workerId].on('connection', (socket: Socket) => {
            console.log("ws connection");
            socket.emit("connection", true);

            socket.on("newMessage", (msg, tokenRoom) => {
                wsWorkers[workerId].to(tokenRoom).emit("msg", msg);
            });

            socket.on("onChatRoomActive", ({ token: tokenRoom, displayName = "" }) => {
                socket.join(tokenRoom);
                wsWorkers[workerId].to(tokenRoom).emit("joinMsg", {
                    tokenRoom,
                    displayName: "System",
                });
            });

        });

        wsWorkers[workerId].on('disconnect', (socket: Socket) => {
            console.log(socket.eventNames);
            console.log('user disconnected');
        });
    }
}

export default Chat;