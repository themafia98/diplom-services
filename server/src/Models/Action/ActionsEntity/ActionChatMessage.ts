import { Model, Document } from "mongoose";
import { ActionParams, Actions } from "../../../Utils/Interfaces";
import { ParserData } from "../../../Utils/Types";
import Utils from "../../../Utils";
import _ from "lodash";
const { getModelByName } = Utils;

class ActionChatMessage {
    constructor(private entity: Actions) {}

    getEntity(): Actions {
        return this.entity;
    }

    public async run(actionParam: ActionParams): ParserData {
        const model: Model<Document> | null = getModelByName("chatMsg", "chatMsg");

        if (!model) return null;

        if (this.getEntity().getActionType() === "get_msg_by_token") {
            const { options: { tokenRoom = "", moduleName = "", membersIds = [] } = {} } = <Record<string, any>>(
                actionParam
            );

            if (!tokenRoom || !moduleName) {
                console.error("Bad tokenRoom or moduleName in get_msg_by_token action");
                return null;
            }

            const query: ActionParams = { tokenRoom, moduleName, authorId: { $in: membersIds } };
            return this.getEntity().getAll(model, query);
        }

        return null;
    }
}

export default ActionChatMessage;
