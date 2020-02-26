import { ActionProps, ActionParams, EntityActionApi, FileApi } from "../../Utils/Interfaces";
import { ParserData } from "../../Utils/Types";
import uuid from "uuid/v4";
import { files } from "dropbox";
import { Model, Document, Query } from "mongoose";
import Utils from "../../Utils";

namespace Action {
    const { getModelByName, checkEntity } = Utils;

    abstract class ActionEntity implements EntityActionApi {
        private actionPath: string = "";
        private actionType: string = "";
        private store: FileApi;

        constructor(props: ActionProps) {
            this.actionPath = props.actionPath;
            this.actionType = props.actionType;
            this.store = (props as Record<string, any>).store;
        }

        public getActionPath(): string {
            return this.actionPath;
        }

        public getActionType(): string {
            return this.actionType;
        }

        public getStore(): FileApi {
            return this.store;
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

        private async createEntity(model: Model<Document>, item: object) {
            try {
                console.log("create entity:", item);
                const actionData: Document = await model.create(item);
                return actionData;
            } catch (err) {
                console.error(err);
                return null;
            }
        }

        private async deleteEntity(model: Model<Document>, query: ActionParams) {
            try {
                const { tokenRoom, uid, updateField } = query;
                const actionData: Document = await model.update(
                    { tokenRoom },
                    {
                        $pullAll: { [<string>updateField]: [uid] }
                    }
                );

                const roomDoc: Document | null = await model.findOne({ tokenRoom });

                if (!roomDoc) {
                    return null;
                }

                const record: ArrayLike<string> = (roomDoc as Record<string, any>)[<string>updateField];

                if (Array.isArray(record) && (!record.length || record.length === 0)) {
                    const roomDocResult: Record<string, any> = await model.deleteOne({ tokenRoom });

                    if (roomDocResult.ok) {
                        return roomDocResult;
                    } else return null;
                }

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
                            const {
                                body: { queryParams = {} }
                            } = <Record<string, any>>actionParam;

                            const entityId: string = (queryParams as Record<string, string>).entityId;
                            const moduleName: string = (actionParam as Record<string, string>).moduleName;

                            const path: string = `/${moduleName}/${entityId}/`;
                            const files: files.ListFolderResult | null = await this.getStore().getFilesByPath(path);
                            return files;
                        }

                        if (this.getActionType() === "delete_file") {
                            const { body: { queryParams = {}, store = "" } = {} } = <Record<string, any>>actionParam;

                            const file: object = (queryParams as Record<string, any>).file;
                            const url: string = (file as Record<string, string>).url || "";

                            const path: string = `${store}${url.split("download")[1]}` || "";

                            const deleteFile: files.DeleteResult | null = await this.getStore().deleteFile(path);

                            if (!deleteFile) return null;
                            else return deleteFile;
                        }

                        if (this.getActionType() === "download_files") {
                            const entityId: string = (actionParam as Record<string, string>).entityId;
                            const filename: string = (actionParam as Record<string, string>).filename;
                            const moduleName: string = (actionParam as Record<string, string>).moduleName;

                            const path: string = `/${moduleName}/${entityId}/${filename}`;

                            const file: files.FileMetadata | null = await this.getStore().downloadFile(path);
                            return file;
                        }

                        break;
                    }

                    case "chatRoom": {
                        const model: Model<Document> | null = getModelByName("chatRoom", "chatRoom");

                        if (!model) return null;

                        if (this.getActionType() === "get_update_rooms") {
                            const { queryParams: { tokenRoom = "", moduleName = "" } = {} } = <Record<string, any>>actionParam || {};
                            const query: ActionParams = { tokenRoom, moduleName };
                            return this.getAll(model, query);
                        }

                        if (this.getActionType() === "entrypoint_chat") {
                            const socket: object = (actionParam as Record<string, any>).socket || {};
                            const uid: string = (actionParam as Record<string, string>).uid;
                            const { socketConnection = false, module: moduleName = "" } = <Record<string, any>>socket;
                            const query: ActionParams = { moduleName, membersIds: { $in: [uid] } };

                            if (socketConnection && moduleName) return this.getAll(model, query);
                        }

                        if (this.getActionType() === "create_chatRoom") {
                            if (!actionParam) return null;

                            const mode: string =
                                actionParam.type && actionParam.type === "single" ? "equalSingle" : "equal";

                            const isValid: boolean = await checkEntity(mode, "membersIds", actionParam, model);

                            if (!isValid) return null;

                            const actionData: Document | null = await this.createEntity(model, {
                                ...actionParam,
                                tokenRoom: uuid()
                            });
                            return actionData;
                        }

                        if (this.getActionType() === "leave_room") {
                            const uid: string = (actionParam as Record<string, string>).uid;
                            const roomToken: string = (actionParam as Record<string, string>).roomToken;
                            const updateField: string = (actionParam as Record<string, string>).updateField;

                            const query = { roomToken, uid, updateField };
                            const actionData: Record<string, any> | null = await this.deleteEntity(model, query);
                            return <Document | null>actionData;
                        }

                        if (this.getActionType() === "create_FakeRoom") {
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


                            const actionData: Document | null = await this.createEntity(model, room);

                            if (!actionData) return null;

                            const saveMsg = await modelMsg.create(msg);

                            if (!saveMsg) return null;

                            console.log("generate room action");
                            return actionData;
                        }

                        break;
                    }

                    case "chatMsg": {
                        const model: Model<Document> | null = getModelByName("chatMsg", "chatMsg");

                        if (!model) return null;

                        if (this.getActionType() === "get_msg_by_token") {
                            const { options: { tokenRoom = "", moduleName = "", membersIds = [] } = {} } = <Record<string, any>>actionParam;

                            if (!tokenRoom || !moduleName) {
                                console.error("Bad tokenRoom or moduleName in get_msg_by_token action");
                                return null;
                            }

                            const query: ActionParams = { tokenRoom, moduleName, authorId: { $in: membersIds } };
                            return this.getAll(model, query);
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
                                const id: string = (queryParams as Record<string, string>).id;
                                const key: string = (queryParams as Record<string, string>).key;

                                let updateProps = {};
                                let actionData: Document | null = null;

                                if (this.getActionType().includes("single")) {
                                    const updateField: string = (actionParam as Record<string, string>).updateField;
                                    (updateProps as Record<string, string>)[updateField] = <string>updateItem;
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
                        const model: Model<Document> | null = getModelByName("news", "news");

                        if (!model) return null;

                        if (this.getActionType() === "get_all") {
                            return this.getAll(model, actionParam);
                        }

                        if (this.getActionType() === "create_single_news") {
                            const body: object = <Record<string, any>>actionParam || {};

                            return this.createEntity(model, body);
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
