import { Model, Document } from "mongoose";
import { ActionParams, Actions } from "../../../Utils/Interfaces";
import { ParserData } from "../../../Utils/Types";
import Utils from "../../../Utils";

const { getModelByName } = Utils;

class ActionTasks {
    constructor(private entity: Actions) {}

    getEntity(): Actions {
        return this.entity;
    }

    public async run(actionParam: ActionParams): ParserData {
        const model: Model<Document> | null = getModelByName("tasks", "task");
        if (!model) return null;
        if (this.getEntity().getActionType() === "set_single") {
            try {
                const actionData: Document | null = await this.getEntity().createEntity(model, actionParam);
                return actionData;
            } catch (err) {
                console.error(err);
                return null;
            }
        } else if (
            this.getEntity()
                .getActionType()
                .includes("update_")
        ) {
            try {
                /** Params for query */
                const { queryParams = {}, updateItem = "" } = actionParam;
                const id: string = (queryParams as Record<string, string>).id;
                const key: string = (queryParams as Record<string, string>).key;

                let updateProps = {};
                let actionData: Document | null = null;

                if (
                    this.getEntity()
                        .getActionType()
                        .includes("single")
                ) {
                    const updateField: string = (actionParam as Record<string, string>).updateField;
                    (updateProps as Record<string, string>)[updateField] = <string>updateItem;
                } else if (
                    this.getEntity()
                        .getActionType()
                        .includes("many")
                ) {
                    const { updateItem = "" } = actionParam;
                    updateProps = updateItem;
                }

                await model.updateOne({ _id: id }, updateProps);
                actionData = await model.findById(id);

                return actionData;
            } catch (err) {
                console.log(err);
                return null;
            }
        } else if (this.getEntity().getActionType() === "get_all") {
            return this.getEntity().getAll(model, actionParam);
        }

        return null;
    }
}

export default ActionTasks;
