import _ from "lodash";
import { TASK_SCHEMA, USER_SCHEMA } from "./const";

export const getValidateSchema = type => {
    switch (type) {
        case TASK_SCHEMA:
            return {
                key: null,
                status: null,
                name: null,
                priority: null,
                author: null,
                editor: null,
                description: null,
                date: null,
            };
        case USER_SCHEMA:
            return {
                departament: null,
                email: null,
                login: null, // delay firebase
                name: null,
                position: null,
                rules: null, // delay firebase
                status: null,
                surname: null,
                uuid: null, // delay firebase
            };
        default:
            return null;
    }
};

export const validateSchema = (data, schema) => {
    if (!_.isArray(data) || !_.isArray(schema)) return false;
    if (data.length !== schema.length) return false;
    return data.every((dataKey, i) => dataKey === schema[i]);
};
