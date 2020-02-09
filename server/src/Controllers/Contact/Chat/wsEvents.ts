import cluster from 'cluster';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { Model, Document } from "mongoose";
import WebSocketWorker from '../../../Models/WebSocketWorker';
import Database from "../../../Models/Database";
import Utils from "../../../Utils";

export default (ws: WebSocketWorker, dbm: Readonly<Database.ManagmentDatabase>) => {
    const { getModelByName } = Utils;
    const workerId = cluster.worker.id;
    const worker = ws.getWorker(workerId);

    worker.on('connection', (socket: Socket) => {
        console.log("ws connection");
        socket.emit("connection", true);

        socket.on("newMessage", async (msgObj) => {
            const { tokenRoom = "" } = msgObj || {};
            try {

                const model: Model<Document> | null = getModelByName("chatMsg", "chatMsg");
                if (model && tokenRoom) {
                    if (msgObj && _.isObject(msgObj) && (msgObj as Record<string, string>).displayName !== "System") {

                        const saveMsg = await model.create(msgObj);

                        if (!saveMsg) throw new TypeError("Bad msg object");

                        worker.to(tokenRoom).emit("msg", saveMsg);

                    } else worker.to(tokenRoom).emit("msg", msgObj);

                } else throw new TypeError("Error save message");
            } catch (err) {
                console.error(err.message);
            }
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

