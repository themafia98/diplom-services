import _ from "lodash";
import { getValidateSchema, validateSchema } from "./schema";

const forceUpdateDetectedInit = () => {
    window.addEventListener("beforeunload", event => {
        event.returnValue = `Are you sure you want to leave?`;
    });
};

const getSchema = (type, data, mode = null) => {
    if (!_.isObject(data)) return null;
    if (!_.isString(type)) return null;
    if (_.isNull(data)) return null;
    let keysSchema = null;
    const keysData = Object.keys(data);

    const schema = getValidateSchema(type);
    if (schema) keysSchema = Object.keys(schema);
    else return null;

    if (validateSchema(keysData, keysSchema, mode)) return { ...data };
    else return null;
};

export { forceUpdateDetectedInit, getSchema };
