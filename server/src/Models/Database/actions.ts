import mongoose, { Schema, DocumentQuery, Document, Error } from "mongoose";
import _ from "lodash";

import { actionGet, paramAction, schemaConfig } from "../../Utils/Types";
import { Metadata, Builder, ResponseMetadata } from "../../Utils/Interfaces";
import Utils from "../../Utils";

namespace DatabaseActions {
    export const routeDatabaseActions = () => {
        const responseCollection: ResponseMetadata = {};
        let counter = 0;
        return async (
            operation: Object,
            method: string,
            configSchema: schemaConfig,
            callback: Function,
            lengthActions: number,
            clear: Function
        ) => {
            const builderResponse = async ({
                collection = "",
                param
            }: Builder): Promise<DocumentQuery<any, Document> | null | void> => {
                const { methodQuery = "" } = <paramAction>param;
                const collectionModel: any =
                    configSchema && !_.isEmpty(configSchema)
                        ? Utils.getModelByName(<string>configSchema["name"], <string>configSchema["schemaType"])
                        : null;

                param.from = collection;
                param.method = method;

                const createCallback = (err: Error, doc: Document) => {
                    console.log("create mongodb");
                    counter += 1;

                    if (counter === lengthActions || lengthActions === 1) clear();

                    if (err) {
                        console.error(err);
                        responseCollection[method] = {
                            param,
                            metadata: null,
                            isError: true
                        };
                        if (counter === lengthActions || lengthActions === 1) {
                            callback(new Error(`Invalid query. methodQuery: ${methodQuery}.`), null, param);
                        }
                    } else
                        responseCollection[method] = {
                            metadata: doc,
                            isCreate: true,
                            param
                        };

                    if (counter === lengthActions || lengthActions === 1) callback(err, responseCollection);
                };

                const findCallback = (err: Error, data: Metadata) => {
                    counter += 1;

                    if (counter === lengthActions || lengthActions === 1) clear();

                    if (err) {
                        responseCollection[method] = {
                            param,
                            metadata: null,
                            isError: true
                        };

                        if (counter === lengthActions || lengthActions === 1) {
                            callback(new Error(`Invalid query. methodQuery: ${methodQuery}.`), null, param);
                        }
                    } else responseCollection[method] = { metadata: data, param };

                    if (counter === lengthActions || lengthActions === 1) {
                        callback(err, responseCollection);
                    }
                };

                const deleteFindCallback = (err: Error, data: Metadata) => {
                    counter += 1;

                    if (counter === lengthActions || lengthActions === 1) clear();

                    if (err) {
                        responseCollection[method] = {
                            param,
                            metadata: null,
                            isError: true
                        };
                        if (counter === lengthActions || lengthActions === 1) {
                            callback(new Error(`Invalid query. methodQuery: ${methodQuery}.`), null, param);
                        }
                    } else responseCollection[method] = { metadata: data, param };

                    if (counter === lengthActions || lengthActions === 1) {
                        callback(err, responseCollection);
                    }
                };

                /** ------------------------ */

                if (method && method.toLocaleUpperCase().trim() === "GET") {
                    switch (methodQuery) {
                        case "all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                try {
                                    if (counter !== lengthActions) return await collectionModel.find({}, findCallback);
                                } catch (err) {
                                    if (counter === lengthActions || lengthActions === 1) {
                                        return void callback(err, null, param);
                                    }
                                }
                            } else
                                return void callback(
                                    new Error(`Invalid model. methodQuery: ${methodQuery}.`),
                                    null,
                                    param
                                );
                            break;
                        }
                        default:
                            return null;
                    }
                } else if (method && method.toLocaleUpperCase().trim() === "DELETE") {
                    switch (methodQuery) {
                        case "delete_all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                try {
                                    if (counter !== lengthActions)
                                        return await collectionModel.find({}, deleteFindCallback);
                                } catch (err) {
                                    if (counter === lengthActions || lengthActions === 1) {
                                        callback(err, null, param);
                                    }
                                }
                            } else
                                return void callback(
                                    new Error(`Invalid model. methodQuery: ${methodQuery}.`),
                                    null,
                                    param
                                );
                            break;
                        }
                        default:
                            return null;
                    }
                } else if (method && method.toLocaleUpperCase().trim() === "SET") {
                    switch (methodQuery) {
                        case "set_single": {
                            if (collectionModel && !_.isEmpty(collectionModel)) {
                                try {
                                    const { body = {} } = <paramAction>param;
                                    if (counter !== lengthActions)
                                        return await collectionModel.create(body, createCallback);
                                } catch (err) {
                                    if (counter === lengthActions || lengthActions === 1) callback(err, null, param);
                                }
                            } else
                                return void callback(
                                    new Error(`Invalid model. methodQuery: ${methodQuery}.`),
                                    null,
                                    param
                                );
                        }
                    }
                } else return void callback(new Error(`Invalid method. methodQuery: ${methodQuery}.`), null, param);
            };

            if (!_.isObject(operation) && !method) return null;
            return builderResponse(<actionGet>operation);
        };
    };
}

export default DatabaseActions;
