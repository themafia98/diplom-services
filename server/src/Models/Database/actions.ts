import { Error } from "mongoose";
import _ from "lodash";

import { actionGet, paramAction, schemaConfig, BuilderResponse } from "../../Utils/Types";
import { Builder, ResponseMetadata } from "../../Utils/Interfaces";
import Utils from "../../Utils";

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
                } else if (method && method.toLocaleUpperCase().trim() === "UPDATE") {
                    switch (methodQuery) {
                        case "set_single": {
                            if (collectionModel && !_.isEmpty(collectionModel)) {
                                try {
                                    let isError = false;
                                    const { body } = <paramAction>param;
                                    const isDescription = body && (<any>body).updateField ?
                                        (<any>body).updateField['type'] === "description" : null;
                                    const query = body && (<any>body).id ? (<any>body).id : null;
                                    if (!isDescription) throw new Error("Types erro task action");

                                    const conifgUpdate = isDescription ? {
                                        description: (<any>body).updateField["description"]
                                    } : null;

                                    const data = await collectionModel.update(query, {
                                        conifgUpdate
                                    })
                                        .catch((err: Error) => {
                                            responseCollection[method] = { metadata: data, param, err };
                                            isError = true;
                                        });

                                    if (!data) {
                                        console.error("No data update:", body);
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
