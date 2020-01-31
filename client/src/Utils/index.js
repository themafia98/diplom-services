import _ from "lodash";

/**
 * @return {void} void
 */
const forceUpdateDetectedInit = () => {
    window.addEventListener("beforeunload", event => {
        event.returnValue = `Are you sure you want to leave?`;
    });
};

/**
 * @return {string} route path string
 *  @param {string} pageType string
 *  @param {string | null} path string or null
 */
export const routeParser = ({ pageType = "module", path: route = null }) => {
    if (typeof route !== "string") return "";

    if (pageType === "page") {
        const arrayDataRoute = route.split(/__/gi);
        const page = arrayDataRoute[0];
        const pageChild = arrayDataRoute[1] ? arrayDataRoute[1] : null;
        return { page, pageChild, path: route };
    } else if (pageType === "moduleItem") {
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

/**
 *  @return {object} object with normalize path
 *  @param {string} pathType string
 *  @param {Object} pathData Object
 *  @param {string} page string (pathData)
 *  @param {string} moduleId string (pathData)
 *  @param {string} key string (pathData)
 */
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

export { forceUpdateDetectedInit };
