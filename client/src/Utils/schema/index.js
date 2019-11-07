import _ from "lodash";
import { TASK_SCHEMA, USER_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from "./const";

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
                modeAdd: "any",
            };
        case TASK_CONTROLL_JURNAL_SCHEMA:
            return {
                key: null,
                id: null,
                timeLost: null,
                editor: null,
                date: null,
                description: null,
                modeAdd: "any",
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
                modeAdd: "any",
            };
        default:
            return null;
    }
};

export const validateSchema = (data, schema, mode = "no-strict") => {
    if (!_.isArray(data) || !_.isArray(schema)) return false;

    const isFind = schema.findIndex(it => it === "modeAdd") !== -1;
    const isFindBoth = isFind && data.findIndex(it => it === "modeAdd") !== -1;
    if (
        (isFindBoth && data.length !== schema.length) ||
        (isFind && !isFindBoth && data.length + 1 !== schema.length) ||
        (!isFind && data.length !== schema.length)
    )
        return false;

    return mode !== "no-strict"
        ? data.every((dataKey, i) => dataKey === schema[i])
        : data.every((dataKey, i) => schema.findIndex(it => it === dataKey) !== -1);
};
