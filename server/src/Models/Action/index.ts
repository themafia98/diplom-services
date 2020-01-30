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

        public async getActionData(actionParam: ActionParams = {}): Promise<any> {

            try {


                switch (this.getActionPath()) {

                    case "users": {

                        if (this.getActionType() === "get_all") {

                            const model: Model<Document> | null = getModelByName("users", "users");

                            if (!model) return null;

                            try {
                                const actionData: Array<Document> = await model.find(actionParam)
                                return actionData;
                            } catch (err) {
                                console.error(err);
                                return null;
                            }
                        }

                        break;
                    }

                    case "tasks": {

                        if (this.getActionType() === "set_single") {

                            const model: Model<Document> | null = getModelByName("tasks", "task");

                            if (!model) return null;

                            try {
                                const actionData: Document = await model.create(actionParam);
                                return actionData;
                            } catch (err) {
                                console.error(err);
                                return null;
                            }
                        }

                        if (this.getActionType() === "get_all") {

                            const model: Model<Document> | null = getModelByName("tasks", "task");

                            if (!model) return null;

                            try {
                                const actionData: Array<Document> = await model.find({});
                                return actionData;
                            } catch (err) {
                                console.error(err);
                                return null;
                            }
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