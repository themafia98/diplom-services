import mongoose, { Schema, DocumentQuery, Document } from "mongoose";
import _ from "lodash";
import { actionGet, paramAction } from "../../Utils/types";
namespace DatabaseActions {

    export const routeDatabaseActions = async (operation: Object, method: string, schema: Schema, callback: Function) => {
        const GET = ({ collection = "", param = {} }): DocumentQuery<any, Document> | null | void => {

            const { metadataSearch = {}, methodQuery = "" } = (<paramAction>param);
            const collectionModel = schema && collection ? mongoose.model(collection, schema) : null;
            switch (methodQuery) {
                case "all":
                    return collectionModel ? collectionModel.find({}, callback) : callback(new Error("Invalid"), { status: "Invalid" });
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
