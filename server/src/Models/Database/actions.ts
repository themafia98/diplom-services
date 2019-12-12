import mongoose, { Schema, DocumentQuery, Document } from "mongoose";
import _ from "lodash";
import { actionGet, paramAction } from "../../Utils/Types";
namespace DatabaseActions {

    export const routeDatabaseActions = async (operation: Object, schema: Schema, callback: Function) => {
        const GET = ({ collection = "", param = {}, method = "" }): DocumentQuery<any, Document> | null => {

            const { metadataSearch = {} } = (<paramAction>param);
            const collectionModel = mongoose.model(collection, schema);

            switch (method) {
                case "all":
                    return collectionModel.find(metadataSearch, callback);
                default: return null;
            }
        };

        if (!_.isObject(operation) && !(<any>operation).method) return;

        switch ((<any>operation).method) {
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
