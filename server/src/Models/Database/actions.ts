import mongoose, { Schema, DocumentQuery, Document, Error } from "mongoose";
import _ from "lodash";

import { actionGet, paramAction, schemaConfig } from "../../Utils/Types";
import { Metadata } from "../../Utils/Interfaces";
import Utils from "../../Utils";

namespace DatabaseActions {
    export const routeDatabaseActions = () => {
        const responseCollection: Object = {};
        let counter = 0;
        return async (
            operation: Object,
            method: string,
            configSchema: schemaConfig,
            callback: Function,
            lengthActions: number
        ) => {
            const builderResponse = async ({
                collection = "",
                param = {}
            }): Promise<DocumentQuery<any, Document> | null | void> => {
                const { methodQuery = "" } = <paramAction>param;
                const collectionModel: any =
                    configSchema && !_.isEmpty(configSchema)
                        ? Utils.getModelByName(<string>configSchema["name"], <string>configSchema["schemaType"])
                        : null;

                (<any>param).from = collection;
                (<any>param).method = method;
                if (method && method.toLocaleUpperCase().trim() === "GET") {
                    switch (methodQuery) {
                        case "all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                try {
                                    return await collectionModel.find({}, (err: Error, data: Metadata) => {
                                        counter += 1;
                                        if (err) {
                                            (<any>responseCollection)[method] = {
                                                param,
                                                metadata: null,
                                                isError: true
                                            };
                                            if (counter === lengthActions || lengthActions === 1) {
                                                callback(
                                                    new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                                    null,
                                                    param
                                                );
                                            }
                                        } else (<any>responseCollection)[method] = { metadata: data, param };

                                        if (counter === lengthActions || lengthActions === 1) {
                                            callback(err, responseCollection);
                                        }
                                    });
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
                                    return await collectionModel.find({}, (err: Error, data: Metadata) => {
                                        counter += 1;
                                        if (err) {
                                            (<any>responseCollection)[method] = {
                                                param,
                                                metadata: null,
                                                isError: true
                                            };
                                            if (counter === lengthActions || lengthActions === 1) {
                                                callback(
                                                    new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                                    null,
                                                    param
                                                );
                                            }
                                        } else (<any>responseCollection)[method] = { metadata: data, param };

                                        if (counter === lengthActions || lengthActions === 1) {
                                            callback(err, responseCollection);
                                        }
                                    });
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
                                    const { body = {} } = <paramAction>param;;
                                    return await collectionModel.save(body, (err: Error) => {
                                        counter += 1;
                                        if (err) {
                                            (<any>responseCollection)[method] = {
                                                param,
                                                metadata: null,
                                                isError: true
                                            };
                                            if (counter === lengthActions || lengthActions === 1) {
                                                callback(
                                                    new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                                    null,
                                                    param
                                                );
                                            }
                                        } else (<any>responseCollection)[method] = { metadata: null, isCreate: true, param };

                                        if (counter === lengthActions || lengthActions === 1) callback(err, responseCollection);
                                    });
                                } catch (err) {
                                    if (counter === lengthActions) callback(err, null, param);
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
