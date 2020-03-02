import _ from "lodash";
import { сachingAction, setStatus, errorRequstAction } from "../";
import { updateItemStateAction } from "../../routerActions";
import { TASK_CONTROLL_JURNAL_SCHEMA, USER_SCHEMA, TASK_SCHEMA } from "../../../../Models/Schema/const";

/**
 * Middleware
 * @param {object} props
 * @param {object} schema - validator
 * @param {object} Request - http requests
 * @param {clientDB} clientDB - IndexedDB methods
 */

const middlewareCaching = (props = {}) => async (dispatch, getState, { schema, Request, clientDB }) => {
    const { requestError, status = "online" } = getState().publicReducer;

    const { actionType = "", item = {}, depKey = "", depStore = "", store = "" } = props;

    if (status === "online") {
        switch (actionType) {
            case "__setJurnal": {
                try {
                    const path = `/${depStore}/caching/jurnal`;
                    const rest = new Request();

                    const body = { queryParams: { depKey, depStore }, item };

                    const res = await rest.sendRequest(path, "POST", body, true);

                    if (!res || res.status !== 200) throw new Error("Bad update");

                    const updaterItem = { ...res["data"]["response"]["metadata"] };

                    const schemTemplate =
                        store === "jurnalworks"
                            ? TASK_CONTROLL_JURNAL_SCHEMA
                            : store === "users"
                            ? USER_SCHEMA
                            : store === "tasks"
                            ? TASK_SCHEMA
                            : null;

                    // const validHash = [updaterItem]
                    //     .map(it => schema.getSchema(schemTemplate, it))
                    //     .filter(Boolean);
                    const validHash = updaterItem;

                    if (validHash) {
                        clientDB.addItem(store, validHash);

                        dispatch(сachingAction({ data: validHash, load: true, primaryKey: actionType }));
                    } else throw new Error("Invalid data props");
                } catch (error) {
                    console.error(error);
                    dispatch(errorRequstAction(error.message));
                }

                break;
            }

            default: {
                break;
            }
        }
    }
};

const loadCacheData = (props = {}) => async (dispatch, getState, { schema, Request, clientDB }) => {
    const {
        actionType = "", // key
        depKey = "",
        depStore = "",
        store = ""
    } = props;

    const { requestError, status = "online" } = getState().publicReducer;

    if (status === "online") {
        switch (actionType) {
            case "__setJurnal": {
                try {
                    const path = `/${depStore}/caching/list`;
                    const rest = new Request();

                    const body = { queryParams: { depKey, store }, actionType };

                    const res = await rest.sendRequest(path, "POST", body, true);

                    if (!res || res.status !== 200) throw new Error("Bad update");

                    const updaterItem = { ...res["data"]["response"]["metadata"] };

                    const schemTemplate =
                        store === "jurnalworks"
                            ? TASK_CONTROLL_JURNAL_SCHEMA
                            : store === "users"
                            ? USER_SCHEMA
                            : store === "tasks"
                            ? TASK_SCHEMA
                            : null;

                    // const validHash = [updaterItem]
                    //     .map(it => schema.getSchema(schemTemplate, it))
                    //     .filter(Boolean);
                    const validHash = updaterItem;

                    if (validHash) {
                        clientDB.addItem(store, validHash);
                        dispatch(сachingAction({ data: validHash, load: true, primaryKey: actionType }));
                    } else throw new Error("Invalid data props");
                } catch (error) {
                    console.error(error);
                    dispatch(errorRequstAction(error.message));
                }

                break;
            }

            default: {
                break;
            }
        }
    }
};

/**
 * Middleware
 * @param {object} props
 * @param {object} schema - validator
 * @param {object} Request - http requests
 * @param {clientDB} clientDB - IndexedDB methods
 */

const middlewareUpdate = (props = {}) => async (dispatch, getState, { schema, Request, clientDB }) => {
    /**
     * Props
     * @param {string} id
     * @param {string} key
     * @param {string} updateField
     * @param {Object} item
     * @param {object | string} updateItem
     * @param {object} store
     * @param {string} actionType
     */
    const {
        id = "",
        key = "",
        type = "UPDATE",
        updateField = "",
        item = {},
        updateItem,
        store = {},
        actionType = "default"
    } = props;

    const router = getState().router;
    const { requestError, status = "online" } = getState().publicReducer;

    if (status === "online") {
        switch (type) {
            case "UPDATE": {
                try {
                    const path = actionType === "update_many" ? `/${store}/update/many` : `/${store}/update/single`;
                    const rest = new Request();

                    const body = { queryParams: { id, key }, updateItem, updateField };

                    const res = await rest.sendRequest(path, "POST", body, true);

                    if (!res || res.status !== 200) throw new Error("Bad update");

                    const updaterItem = { ...res["data"]["response"]["metadata"] };

                    const schemTemplate =
                        store === "jurnalworks"
                            ? TASK_CONTROLL_JURNAL_SCHEMA
                            : store === "users"
                            ? USER_SCHEMA
                            : store === "tasks"
                            ? TASK_SCHEMA
                            : null;

                    const storeCopy = [updaterItem].map(it => schema.getSchema(schemTemplate, it)).filter(Boolean);

                    if (storeCopy) {
                        dispatch(
                            updateItemStateAction({
                                updaterItem: updaterItem,
                                type,
                                id
                            })
                        );

                        clientDB.updateItem(store, updaterItem);
                        break;
                    }
                } catch (error) {
                    console.error(error);
                    dispatch(errorRequstAction(error.message));
                    break;
                }
            }

            case "DELETE": {
                break;
            }

            default: {
                break;
            }
        }
    }
};

export { middlewareCaching, middlewareUpdate, loadCacheData };
