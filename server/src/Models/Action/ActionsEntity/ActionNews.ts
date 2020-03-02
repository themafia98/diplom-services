import { Model, Document } from "mongoose";
import { ActionParams, Actions } from "../../../Utils/Interfaces";
import { ParserData } from "../../../Utils/Types";
import Utils from "../../../Utils";
import _ from "lodash";
const { getModelByName } = Utils;

class ActionNews {
    constructor(private entity: Actions) {}

    getEntity(): Actions {
        return this.entity;
    }

    public async run(actionParam: ActionParams): ParserData {
        const model: Model<Document> | null = getModelByName("news", "news");

        if (!model) return null;

        if (this.getEntity().getActionType() === "get_all") {
            return this.getEntity().getAll(model, actionParam);
        }

        if (this.getEntity().getActionType() === "create_single_news") {
            const body: object = <Record<string, any>>actionParam || {};

            return this.getEntity().createEntity(model, body);
        }

        return null;
    }
}

export default ActionNews;
