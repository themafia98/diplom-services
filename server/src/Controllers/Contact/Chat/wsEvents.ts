import cluster from 'cluster';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { Model, Document } from "mongoose";
import WebSocketWorker from '../../../Models/WebSocketWorker';
import Database from "../../../Models/Database";
import Chat from "./";
import Utils from "../../../Utils";
import { Server as HttpServer } from "http";
import { ParserResult } from '../../../Utils/Types';

export default (ws: WebSocketWorker, dbm: Readonly<Database.ManagmentDatabase>, server: HttpServer) => {
    const { getModelByName } = Utils;
    const { createRealRoom } = Chat;
    const workerId = cluster.worker.id;
    const worker = ws.getWorker(workerId);


    worker.on('connection', (socket: Socket) => {
        console.log("ws connection");
        socket.emit("connection", true);

        const callbackFakeRoom = (result: ParserResult, fakeMsg: object) => {
            const { tokenRoom = "", membersIds = [] } = <Record<string, any>>result || {};
            socket.join(tokenRoom);
            const response = { room: result, msg: fakeMsg };
            worker.to(tokenRoom).emit("updateFakeRoom", response);
            socket.broadcast.emit("updateChatsRooms", { ...response, fullUpdate: true, activeModule: "chat" });
        }

        socket.on("newMessage", async (msgObj: Record<string, any>) => {
            console.log("workerId:", workerId);
            const { tokenRoom = "" } = msgObj || {};
            try {
                console.log("newMessage");
                const model: Model<Document> | null = getModelByName("chatMsg", "chatMsg");

                if (model && tokenRoom) {
                    const displayName = (msgObj as Record<string, string>).displayName;
                    if (msgObj && _.isObject(msgObj) && displayName !== "System") {

                        const saveMsg = await model.create(msgObj);

                        if (!saveMsg) throw new TypeError("Bad msg object");
                        console.log("tokenRoom:", tokenRoom);
                        worker.to(tokenRoom).emit("msg", saveMsg);

                    } else worker.to(tokenRoom).emit("msg", msgObj);

                } else throw new TypeError("Error save message");
            } catch (err) {
                console.error(err.message);
            }
        });

        socket.on("initFakeRoom", async (fakeData: Record<string, any>) => {
            const { fakeMsg = {}, interlocutorId = "" } = fakeData || {};


            if (!_.isEmpty(fakeMsg) && interlocutorId) {
                const result: ParserResult = await createRealRoom(fakeMsg, interlocutorId);

                if (result) {
                    console.log("updateFakeRoom", result);
                    callbackFakeRoom(result, fakeMsg);
                }

            }
        })

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

