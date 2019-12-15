import mongoose, { Schema, DocumentQuery, Document } from "mongoose";
import _ from "lodash";

import { actionGet, paramAction, schemaConfig } from "../../Utils/Types";
import Utils from '../../Utils';

namespace DatabaseActions {

    export const routeDatabaseActions = () => {
        const responseCollection: Object = {};
        return async (operation: Object, method: string, configSchema: schemaConfig, callback: Function, ready: boolean) => {
            const builderResponse = ({ collection = "", param = {} }): DocumentQuery<any, Document> | null | void => {

                const { methodQuery = "" } = (<paramAction>param);
                const collectionModel = configSchema && !_.isEmpty(configSchema) ?
                    Utils.getModelByName(<string>configSchema['name'], <string>configSchema['schemaType']) : null;

                (<any>param).from = collection;
                (<any>param).method = method;

                if (method.toLocaleUpperCase().trim() === 'GET') {
                    switch (methodQuery) {
                        case "all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                return collectionModel.find({},
                                    (err: Error, data: Object) => {
                                        (<any>responseCollection)[method] = { metadata: data, param };
                                        if (ready) callback(err, responseCollection);
                                    })
                            } else
                                return void callback(new Error(`Invalid. methodQuery: ${methodQuery}.`), { status: "Invalid" }, param);
                        }
                        default: return null;
                    }
                } else if (method.toLocaleUpperCase().trim() === 'DELETE') {
                    switch (methodQuery) {
                        case "delete_all": {
                            if (collectionModel && !_.isNull(collectionModel)) {
                                return collectionModel.find({},
                                    (err: Error, data: Object) => {
                                        (<any>responseCollection)[method] = { metadata: data, param };
                                        if (ready) callback(err, responseCollection);
                                    })
                            } else
                                return void callback(new Error(`Invalid. methodQuery: ${methodQuery}.`), { status: "Invalid" }, param);
                        }
                        default: return null;
                    }
                } else return void callback(new Error(`Invalid. methodQuery: ${methodQuery}.`), { status: "Invalid" }, param);
            }

            if (!_.isObject(operation) && !method) return;
            return builderResponse(<actionGet>operation);
        };
    };
}

export default DatabaseActions;
