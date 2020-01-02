import mongoose, { Model, DocumentQuery, Document, Error } from "mongoose";
import _ from "lodash";

import { actionGet, paramAction, schemaConfig, BuilderResponse } from "../../Utils/Types";
import { Metadata, Builder, ResponseMetadata } from "../../Utils/Interfaces";
import Utils from "../../Utils";

namespace DatabaseActions {
    export const routeDatabaseActions = () => {
        const responseCollection: ResponseMetadata = {};
        return async (operation: Object, method: string, configSchema: schemaConfig): Promise<BuilderResponse | null> => {
            const builderResponse = async ({ collection = "", param, exit = false, exitData }: Builder): BuilderResponse => {
                console.log(exitData);
                console.log(" <- exitdata");
                if (exit) return { exitData, exit: true };

                const { methodQuery = "" } = <paramAction>param;
                const collectionModel: any = configSchema && !_.isEmpty(configSchema)
                    ? Utils.getModelByName(<string>configSchema["name"], <string>configSchema["schemaType"])
                    : null;

                /** response info */
                (<paramAction>param).from = collection;
                (<paramAction>param).method = method;

                /** callbacks for mongodb response */
                const createCallback = async (err: Error, doc: Document | null): BuilderResponse => {
                    if (err) {
                        console.error(err);
                        responseCollection[method] = {
                            param,
                            metadata: null,
                            isError: true
                        };
                        return builderResponse({
                            exit: true,
                            exitData: {
                                err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                data: null,
                                param
                            }
                        });
                    } else {
                        responseCollection[method] = {
                            metadata: doc,
                            isCreate: true,
                            param
                        };
                        return builderResponse({
                            exit: true,
                            exitData: {
                                err,
                                data: responseCollection,
                                param,
                            }
                        });
                    };
                };

                const findCallback = async (err: Error, data: Metadata | null): BuilderResponse => {
                    if (err) {
                        responseCollection[method] = {
                            param,
                            metadata: null,
                            isError: true
                        };

                        return await builderResponse({
                            exit: true,
                            exitData: {
                                err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                data: null,
                                param
                            }
                        });
                    } else {
                        responseCollection[method] = { metadata: data, param };
                        return await builderResponse({
                            exit: true,
                            exitData: {
                                err,
                                data: responseCollection,
                                param
                            }
                        });
                    }
                };

                const deleteFindCallback = async (err: Error, data: Metadata | null) => {
                    if (err) {
                        responseCollection[method] = {
                            param,
                            metadata: null,
                            isError: true
                        };
                        return await builderResponse({
                            exit: true,
                            exitData: {
                                err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                data: null,
                                param
                            }
                        });

                    } else {
                        responseCollection[method] = { metadata: data, param };
                        return await builderResponse({
                            exit: true,
                            exitData: {
                                err,
                                data: responseCollection,
                                param
                            }
                        })
                    }
                };

                /** ------------------------ */
                if (method && method.toLocaleUpperCase().trim() === "GET") {
                    switch (methodQuery) {
                        case "all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                try {
                                    return await collectionModel.find({}, findCallback);
                                } catch (err) {
                                    return await findCallback(err, null);
                                }
                            } else
                                return await findCallback(new Error(`Invalid model. methodQuery: ${methodQuery}.`), null)
                        }
                        default:
                            return null;
                    }
                } else if (method && method.toLocaleUpperCase().trim() === "DELETE") {
                    switch (methodQuery) {
                        case "delete_all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                try {
                                    return await collectionModel.find({}, deleteFindCallback);
                                } catch (err) {
                                    return await deleteFindCallback(err, null);
                                }
                            } else
                                return await deleteFindCallback(new Error(`Invalid model. methodQuery: ${methodQuery}.`), null);
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
                                    return await collectionModel.create(body, createCallback);
                                } catch (err) {
                                    return await createCallback(err, null);
                                }
                            } else
                                return await createCallback(new Error(`Invalid model. methodQuery: ${methodQuery}.`), null);
                        }
                    }
                }
                else return { err: new Error(`Invalid method. methodQuery: ${methodQuery}.`), param };
            };

            if (!_.isObject(operation) && !method) return null;
            return await builderResponse(<actionGet>operation);
        };
    };
}

export default DatabaseActions;
