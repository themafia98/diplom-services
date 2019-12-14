import mongoose, { Schema, DocumentQuery, Document } from "mongoose";
import _ from "lodash";

import { actionGet, paramAction, schemaConfig } from "../../Utils/types";
import Utils from '../../Utils';

namespace DatabaseActions {

    export const routeDatabaseActions = async (operation: Object, method: string, configSchema: schemaConfig, callback: Function) => {
        const GET = ({ collection = "", param = {} }): DocumentQuery<any, Document> | null | void => {

            const { metadataSearch = {}, methodQuery = "" } = (<paramAction>param);
            const collectionModel = configSchema && !_.isEmpty(configSchema) ?
                Utils.getModelByName(<string>configSchema['name'], <string>configSchema['schemaType']) : null;
            switch (methodQuery) {
                case "all":
                    return collectionModel && !_.isNull(collectionModel) ? collectionModel.find({}, callback) :
                        callback(new Error(`Invalid. methodQuery: ${methodQuery}.`), { status: "Invalid" });
                default: return null;
            }
        };

        if (!_.isObject(operation) && !method) return;

        switch (method) {
            case "GET": return GET(<actionGet>operation);

            case "PUT": {
                break;
            }

            case "DELETE": {
                break;
            }

            case "UPDATE": {
                break;
            }
        }
    };
}

export default DatabaseActions;
