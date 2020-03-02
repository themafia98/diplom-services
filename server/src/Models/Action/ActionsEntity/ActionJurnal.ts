import { Model, Document } from "mongoose";
import { ActionParams, Actions } from "../../../Utils/Interfaces";
import { ParserData } from "../../../Utils/Types";
import Utils from "../../../Utils";

const { getModelByName } = Utils;

class ActionJurnal {
    constructor(private entity: Actions) {}

    getEntity(): Actions {
        return this.entity;
    }

    public async run(actionParam: ActionParams): ParserData {
        const model: Model<Document> | null = getModelByName("jurnalworks", "jurnalworks");
        if (!model) return null;

        // Get jurnal action. Starts with '__set' journals key becouse
        // set for synchronize with client key
        if (this.getEntity().getActionType() === "__setJurnal") {
            const { depKey } = actionParam;
            const conditions = { depKey };
            const actionData: Document[] | null = await this.getEntity().getAll(model, conditions);
            return actionData;
        }

        if (this.getEntity().getActionType() === "set_jurnal") {
            try {
                const { item = {} } = actionParam;
                console.log("current item:", item);
                const actionData: Document | null = await this.getEntity().createEntity(model, <object>item);
                console.log("actionData:", actionData);
                return actionData;
            } catch (err) {
                console.error(err);
                return null;
            }
        }

        return null;
    }
}

export default ActionJurnal;
