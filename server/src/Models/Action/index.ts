import { ActionProps, ActionParams } from '../../Utils/Interfaces';
import { ActionData } from "../../Utils/Types";
import { Model, Document } from 'mongoose';
import Utils from '../../Utils';

namespace Action {
    const { getModelByName } = Utils;

    abstract class ActionEntity {
        private actionPath: string = "";
        private actionType: string = "";

        constructor(props: ActionProps) {
            this.actionPath = props.actionPath;
            this.actionType = props.actionType;
        }

        public getActionPath(): string {
            return this.actionPath;
        }

        public getActionType(): string {
            return this.actionType;
        }

    }

    export class ActionParser extends ActionEntity {
        constructor(props: ActionProps) {
            super(props);
        }


        private async getAll(model: Model<Document>, actionParam: ActionParams) {
            try {
                const actionData: Array<Document> = await model.find(actionParam);
                return actionData;
            } catch (err) {
                console.error(err);
                return null;
            }
        }


        public async getActionData(actionParam: ActionParams = {}): Promise<any> {
            try {
                switch (this.getActionPath()) {

                    case "users": {

                        if (this.getActionType() === "get_all") {

                            const model: Model<Document> | null = getModelByName("users", "users");

                            if (!model) return null;

                            return this.getAll(model, actionParam);
                        }

                        break;
                    }

                    case "tasks": {
                        const model: Model<Document> | null = getModelByName("tasks", "task");
                        if (!model) return null;
                        console.log(this.getActionType());
                        if (this.getActionType() === "set_single") {
                            try {
                                const actionData: Document = await model.create(actionParam);
                                return actionData;
                            } catch (err) {
                                console.error(err);
                                return null;
                            }
                        } else if (this.getActionType().includes("update_")) {
                            try {

                                /** Params for query */
                                const { queryParams = {}, updateItem = "" } = actionParam;
                                const id: string = (<any>queryParams).id;
                                const key: string = (<any>queryParams).key;

                                let updateProps = {};
                                let actionData: Document | null = null;

                                if (this.getActionType().includes("single")) {

                                    const updateField: string = (<any>actionParam).updateField;
                                    (<any>updateProps)[updateField] = <string>updateItem;

                                } else if (this.getActionType().includes("many")) {
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
                        } else if (this.getActionType() === "get_all") {
                            return this.getAll(model, actionParam);
                        }

                        break;
                    }

                    default: {
                        return null;
                    }
                }

                return null;

            } catch (err) {
                console.error(err);
                return null;
            }
        }
    }
};

export default Action;