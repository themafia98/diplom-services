import { Model, Document } from "mongoose";
import uuid from "uuid";
import { ActionParams, Actions } from "../../../Utils/Interfaces";
import { ParserData } from "../../../Utils/Types";
import Utils from "../../../Utils";

const { getModelByName, checkEntity } = Utils;

class ActionChatRoom {
    constructor(private entity: Actions) {}

    getEntity(): Actions {
        return this.entity;
    }

    public async run(actionParam: ActionParams): ParserData {
        const model: Model<Document> | null = getModelByName("chatRoom", "chatRoom");

        if (!model) return null;

        if (this.getEntity().getActionType() === "get_update_rooms") {
            const { queryParams: { tokenRoom = "", moduleName = "" } = {} } = <Record<string, any>>actionParam || {};
            const query: ActionParams = { tokenRoom, moduleName };
            return this.getEntity().getAll(model, query);
        }

        if (this.getEntity().getActionType() === "entrypoint_chat") {
            const socket: object = (actionParam as Record<string, any>).socket || {};
            const uid: string = (actionParam as Record<string, string>).uid;
            const { socketConnection = false, module: moduleName = "" } = <Record<string, any>>socket;
            const query: ActionParams = { moduleName, membersIds: { $in: [uid] } };

            if (socketConnection && moduleName) return this.getEntity().getAll(model, query);
        }

        if (this.getEntity().getActionType() === "create_chatRoom") {
            if (!actionParam) return null;

            const mode: string = actionParam.type && actionParam.type === "single" ? "equalSingle" : "equal";

            const isValid: boolean = await checkEntity(mode, "membersIds", actionParam, model);

            if (!isValid) return null;

            const actionData: Document | null = await this.getEntity().createEntity(model, {
                ...actionParam,
                tokenRoom: uuid()
            });
            return actionData;
        }

        if (this.getEntity().getActionType() === "leave_room") {
            const uid: string = (actionParam as Record<string, string>).uid;
            const roomToken: string = (actionParam as Record<string, string>).roomToken;
            const updateField: string = (actionParam as Record<string, string>).updateField;

            const query = { roomToken, uid, updateField };
            const actionData: Record<string, any> | null = await this.getEntity().deleteEntity(model, query);
            return <Document | null>actionData;
        }

        if (this.getEntity().getActionType() === "create_FakeRoom") {
            const modelMsg: Model<Document> | null = getModelByName("chatMsg", "chatMsg");
            const msg: Record<string, any> = (actionParam as Record<string, any>).fakeMsg || {};
            const interlocutorId: string = (actionParam as Record<string, string>).interlocutorId;

            const isEmptyMsg = !msg || !msg.authorId || !msg.tokenRoom;

            if (!modelMsg || isEmptyMsg || !interlocutorId || !msg.moduleName) {
                return null;
            }

            const room = {
                type: "single",
                moduleName: msg.moduleName,
                tokenRoom: msg.tokenRoom,
                membersIds: [msg.authorId, interlocutorId],
                groupName: msg.groupName ? msg.groupName : null
            };

            const actionData: Document | null = await this.getEntity().createEntity(model, room);

            if (!actionData) return null;

            const saveMsg = await modelMsg.create(msg);

            if (!saveMsg) return null;

            console.log("generate room action");
            return actionData;
        }

        return null;
    }
}

export default ActionChatRoom;
