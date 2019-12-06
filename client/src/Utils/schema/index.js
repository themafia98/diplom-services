import _ from "lodash";
import { TASK_SCHEMA, USER_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA, NEWS_SCHEMA } from "./const";

/**
 * Schema
 * @param {string} type
 * @return {Object} Object
 */

export const getEditorJSON = () => {
    return {
        entityMap: {},
        blocks: [
            {
                key: "637gr",
                text: "Initialized from content state.",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {}
            }
        ]
    };
};

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
                comments: null, // array [{ id: null, username: null, message: null }]
                modeAdd: "any"
            };
        case TASK_CONTROLL_JURNAL_SCHEMA:
            return {
                key: null,
                id: null,
                timeLost: null,
                editor: null,
                date: null,
                description: null,
                modeAdd: "any"
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
                modeAdd: "any"
            };
        case NEWS_SCHEMA:
            return {
                key: null,
                content: null,
                author: null,
                date: null
            };
        default:
            return null;
    }
};

/**
 * Schema
 * @param {Array<string>} data
 * @param {Array<null>} schema
 * @param {string} mode
 * @return {boolean}
 */
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
