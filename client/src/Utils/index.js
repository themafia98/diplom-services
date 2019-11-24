import _ from "lodash";
import Request from "./xhr";
import { getValidateSchema, validateSchema } from "./schema";

/** @return {void} void */
const forceUpdateDetectedInit = () => {
    window.addEventListener("beforeunload", event => {
        event.returnValue = `Are you sure you want to leave?`;
    });
};

/** @return {object} valid schema object or null */
const getSchema = (type, data, mode = "no-strict") => {
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

/** @return {string} route path */
export const routeParser = ({ pageType = "module", path: route = null }) => {
    if (typeof route !== "string") return "";

    if (pageType === "moduleItem") {
        const arrayDataRoute = route.split(/__/gi);

        if (arrayDataRoute.length < 2 || arrayDataRoute.length > 3) return route;

        const page = arrayDataRoute[0];
        const itemId = arrayDataRoute[1];

        return { page, itemId, path: `${page}__${itemId}` };
    } else if (pageType === "module") {
        const arrayDataRoute = route.split(/_/gi);

        if (arrayDataRoute.length < 2 || arrayDataRoute.length > 3) return route;

        const page = arrayDataRoute[0];
        const moduleId = arrayDataRoute[1];

        return { page, moduleId, path: `${page}_${moduleId}` };
    } else return route;
};

/** @return {object} object with normalize path */
export const routePathNormalise = ({ pathType = "module", pathData: { page = "", moduleId = "", key = "" } = {} }) => {
    if (!page && !moduleId && !key) return "";
    if (typeof page !== "string" || typeof moduleId !== "string" || typeof key !== "string") return "";
    if (pathType === "module") {
        if (!page) return "";
        return { path: moduleId ? `${page}_${moduleId}` : page, moduleId: moduleId, page: page };
    } else if (pathType === "moduleItem") {
        if (!key) return "";
        return { path: moduleId ? `${page}_${moduleId}__${key}` : `${page}__${key}`, page, moduleId, key };
    }
};

export { forceUpdateDetectedInit, getSchema, Request };
