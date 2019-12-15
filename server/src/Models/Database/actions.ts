import mongoose, { Schema, DocumentQuery, Document } from "mongoose";
import _ from "lodash";

import { actionGet, paramAction, schemaConfig } from "../../Utils/Types";
import Utils from '../../Utils';

namespace DatabaseActions {

    export const routeDatabaseActions = async (operation: Object, method: string, configSchema: schemaConfig, callback: Function) => {
        const GET = ({ collection = "", param = {} }, method = ""): DocumentQuery<any, Document> | null | void => {

            const { methodQuery = "" } = (<paramAction>param);
            const collectionModel = configSchema && !_.isEmpty(configSchema) ?
                Utils.getModelByName(<string>configSchema['name'], <string>configSchema['schemaType']) : null;

            (<any>param).from = collection;
            (<any>param).method = method;

            switch (methodQuery) {
                case "all":
                    return collectionModel && !_.isNull(collectionModel) ? collectionModel.find({},
                        (err: Error, data: Object) => callback(err, data, param)) :
                        callback(new Error(`Invalid. methodQuery: ${methodQuery}.`), { status: "Invalid" }, param);
                default: return null;
            }
        };

        if (!_.isObject(operation) && !method) return;

        switch (method) {
            case "GET": return GET(<actionGet>operation, 'GET');

            case "PUT": {
                break;
            }

            case "DELETE": return GET(<actionGet>operation, 'DELETE');

            case "UPDATE": {
                break;
            }
        }
    };
}

export default DatabaseActions;
