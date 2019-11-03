import _ from "lodash";
import { TASK_SCHEMA, USER_SCHEMA, JUR_TASK, TASK_CONTROLL_JURNAL_SCHEMA } from "./const";

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
        case TASK_CONTROLL_JURNAL_SCHEMA:
            return {
                key: null,
                timeLost: null,
                date: null,
                description: null,
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
        case JUR_TASK:
            return {
                timeSpent: null,
                date: null,
                description: null,
            };
        default:
            return null;
    }
};

export const validateSchema = (data, schema, mode) => {
    if (!_.isArray(data) || !_.isArray(schema)) return false;
    if (data.length !== schema.length) return false;
    return mode !== "no-strict"
        ? data.every((dataKey, i) => dataKey === schema[i])
        : data.every((dataKey, i) => schema.findIndex(it => it === dataKey) !== -1);
};
