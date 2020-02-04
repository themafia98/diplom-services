import { ActionProps, ActionParams, DropboxApi } from "../../Utils/Interfaces";
import { ParserData } from "../../Utils/Types";
import { files } from "dropbox";
import { Model, Document } from "mongoose";
import Utils from "../../Utils";

namespace Action {
    const { getModelByName } = Utils;

    abstract class ActionEntity {
        private actionPath: string = "";
        private actionType: string = "";
        private store: DropboxApi;

        constructor(props: ActionProps) {
            this.actionPath = props.actionPath;
            this.actionType = props.actionType;
            this.store = (<any>props).store;
        }

        public getActionPath(): string {
            return this.actionPath;
        }

        public getActionType(): string {
            return this.actionType;
        }

        public getStore() {
            return this.store;
        }
    }

    export class ActionParser extends ActionEntity {
        constructor(props: ActionProps) {
            super(props);
        }

        private async getAll(model: Model<Document>, actionParam: ActionParams) {
            try {
                console.log(actionParam);
                const actionData: Array<Document> = await model.find(actionParam);
                return actionData;
            } catch (err) {
                console.error(err);
                return null;
            }
        }

        private async createEntity(model: Model<Document>, item: object) {
            try {
                const actionData: Document = await model.create(item);
                return actionData;
            } catch (err) {
                console.error(err);
                return null;
            }
        }

        public async getActionData(actionParam: ActionParams = {}): ParserData {
            try {
                console.log(`Run action. actionType: ${this.getActionType()}, actionPath: ${this.getActionPath()}`);

                switch (this.getActionPath()) {
                    case "global": {
                        if (this.getActionType() === "load_files") {
                            const { queryParams } = actionParam;
                            const taskId: string = (<any>queryParams).taskId;

                            const path: string = `/tasks/${taskId}/`;
                            const files: files.ListFolderResult | null = await this.getStore().getFilesByPath(path);
                            return files;
                        }

                        if (this.getActionType() === "download_files") {

                            const taskId: string = (<any>actionParam).taskId;
                            const filename: string = (<any>actionParam).filename;

                            const path: string = `/tasks/${taskId}/${filename}`;

                            const file: files.FileMetadata | null = await this.getStore().downloadFile(path);
                            return file;
                        }

                        if (this.getActionType() === "save_file") {
                        }

                        break;
                    }

                    case "users": {
                        if (this.getActionType() === "get_all") {
                            const model: Model<Document> | null = getModelByName("users", "users");

                            if (!model) return null;

                            return this.getAll(model, actionParam);
                        }

                        break;
                    }

                    case "jurnalworks": {
                        const model: Model<Document> | null = getModelByName("jurnalworks", "jurnalworks");
                        if (!model) return null;

                        // Get jurnal action. Starts with '__set' journals key becouse
                        // set for synchronize with client key
                        if (this.getActionType() === "__setJurnal") {
                            const { depKey } = actionParam;
                            const conditions = { depKey };
                            const actionData: Document[] | null = await this.getAll(model, conditions);
                            return actionData;
                        }

                        if (this.getActionType() === "set_jurnal") {
                            try {
                                const { item = {} } = actionParam;
                                console.log("current item:", item);
                                const actionData: Document | null = await this.createEntity(model, <object>item);
                                console.log("actionData:", actionData);
                                return actionData;
                            } catch (err) {
                                console.error(err);
                                return null;
                            }
                        }

                        break;
                    }

                    case "tasks": {
                        const model: Model<Document> | null = getModelByName("tasks", "task");
                        if (!model) return null;
                        if (this.getActionType() === "set_single") {
                            try {
                                const actionData: Document | null = await this.createEntity(model, actionParam);
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
                                    console.log(updateProps);
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

                    case "news": {
                        if (this.getActionType() === "get_all") {
                            const model: Model<Document> | null = getModelByName("news", "news");

                            if (!model) return null;

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
}

export default Action;
