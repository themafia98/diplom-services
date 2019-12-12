import mongoose from "mongoose";
import _ from "lodash";
import { actionGet } from "../../Utils/Types";
namespace DatabaseActions {
    const Schema = mongoose.Schema;

    export const routeDatabaseActions = async (operation: Object) => {
        const GET = ({ collection = "", param = {} }) => {
            console.log(collection);
            const scheme = new Schema({ test: String }, { versionKey: false });
            const allModel = mongoose.model(collection, scheme);

            allModel.find({}, function(err, docs) {
                if (err) return console.log(err);

                console.log(docs);
            });
        };

        if (!_.isObject(operation) && !(<any>operation).method) return;

        switch ((<any>operation).method) {
            case "GET": {
                GET(<actionGet>operation);
                break;
            }

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
