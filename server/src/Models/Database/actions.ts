import mongoose, { Model, DocumentQuery, Document, Error } from "mongoose";
import _ from "lodash";

import { actionGet, paramAction, schemaConfig, BuilderResponse } from "../../Utils/Types";
import { Metadata, Builder, ResponseMetadata } from "../../Utils/Interfaces";
import Utils from "../../Utils";
import { response } from "express";

namespace DatabaseActions {
    export const routeDatabaseActions = () => {
        const responseCollection: ResponseMetadata = {};
        return async (operation: Object, method: string, configSchema: schemaConfig): Promise<BuilderResponse | null> => {
            const builderResponse = async ({ collection = "", param }: Builder): BuilderResponse => {

                const { methodQuery = "" } = <paramAction>param;
                const collectionModel: any = configSchema && !_.isEmpty(configSchema)
                    ? Utils.getModelByName(<string>configSchema["name"], <string>configSchema["schemaType"])
                    : null;

                /** response info */
                (<paramAction>param).from = collection;
                (<paramAction>param).method = method;

                if (method && method.toLocaleUpperCase().trim() === "GET") {
                    switch (methodQuery) {
                        case "all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                try {
                                    let isError = false;
                                    const data = await collectionModel.find({})
                                        .catch((err: Error) => {
                                            responseCollection[method] = { metadata: data, param, err };
                                            isError = true;
                                        });
                                    if (!isError) responseCollection[method] = { metadata: data, param };
                                    if (!data) {
                                        responseCollection[method] = {
                                            param,
                                            metadata: null,
                                            err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                            isError: true
                                        };
                                    }

                                    return responseCollection;
                                } catch (err) {
                                    responseCollection[method] = { metadata: null, param, err };
                                    return responseCollection;
                                }
                            } else {
                                responseCollection[method] = {
                                    param,
                                    metadata: null,
                                    err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                    isError: true
                                };
                                return responseCollection;
                            }
                        }
                        default:
                            return null;
                    }
                } else if (method && method.toLocaleUpperCase().trim() === "DELETE") {
                    switch (methodQuery) {
                        case "delete_all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                try {
                                    let isError = false;
                                    const data = await collectionModel.find({})
                                        .catch((err: Error) => {
                                            responseCollection[method] = { metadata: data, param, err };
                                            isError = true;
                                        });
                                    if (!data) {
                                        console.error("No data for delete:", data);
                                        responseCollection[method] = {
                                            param,
                                            metadata: null,
                                            err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                            isError: true
                                        };
                                    }

                                    if (!isError) responseCollection[method] = { metadata: data, param };

                                    return responseCollection;
                                } catch (err) {
                                    responseCollection[method] = { metadata: null, param, err };
                                    return responseCollection;
                                }
                            } else {
                                responseCollection[method] = {
                                    param,
                                    metadata: null,
                                    err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                    isError: true
                                };
                                return responseCollection;
                            }
                        }
                        default:
                            return null;
                    }
                } else if (method && method.toLocaleUpperCase().trim() === "SET") {
                    switch (methodQuery) {
                        case "set_single": {
                            if (collectionModel && !_.isEmpty(collectionModel)) {
                                try {
                                    let isError = false;
                                    const { body = {} } = <paramAction>param;
                                    const data = await collectionModel.create(body)
                                        .catch((err: Error) => {
                                            responseCollection[method] = { metadata: data, param, err };
                                            isError = true;
                                        });

                                    if (!data) {
                                        console.error("No data:", body);
                                        responseCollection[method] = {
                                            param,
                                            metadata: null,
                                            err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                            isError: true
                                        };
                                    }

                                    if (!isError) responseCollection[method] = { metadata: data, param };

                                    return responseCollection;
                                } catch (err) {
                                    responseCollection[method] = { metadata: null, param, err };
                                    return responseCollection;
                                }
                            } else {
                                responseCollection[method] = {
                                    param,
                                    metadata: null,
                                    err: new Error(`Invalid query. methodQuery: ${methodQuery}.`),
                                    isError: true
                                };
                                return responseCollection;
                            }
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
