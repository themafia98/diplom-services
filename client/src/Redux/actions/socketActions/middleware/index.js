import { setSocketConnection, onLoadActiveChats, setSocketError } from "../";
import { errorRequstAction } from "../../publicActions";
/**
 * Middleware
 * @param {object} payload chats loading options
 * @param {object} schema - validator
 * @param {object} Request - http requests
 * @param {clientDB} clientDB - IndexedDB methods 
 */

const loadActiveChats = payload => async (dispatch, getState, { schema, Request, clientDB }) => {
    const {
        path = "",
        action = "",
        options: {
            limitList = null,
            udata = {},
            socket: {
                socketConnection = false,
                module: activeModule = "chat"
            } = {}
        } = {},
        options = {}
    } = payload || {};

    try {

        if ((!path || !action) && socketConnection && activeModule) {
            dispatch(setSocketConnection({ socketConnection, activeModule }));
            return;
        }

        const restGlobal = new Request();
        const res = await restGlobal.sendRequest("/system/userList", "GET", null, true);

        if (!res || res.status !== 200) {
            throw new Error("Fail load users list");
        }

        const { data: { response: { metadata: usersList = [] } = {} } } = res || {};


        const rest = new Request();
        const response = await rest.sendRequest(`/${activeModule}/${path}`, "POST", {
            actionPath: action,
            actionType: path,
            queryParams: {
                ...options
            }
        }, true);

        if (!response || response.status !== 200) {
            throw new Error(`Invalid load action (${action}) options`);
        }

        const { data: { response: { metadata: listdata = [] } = {} } } = response || {};


        dispatch(onLoadActiveChats({
            usersList,
            listdata,
            options
        }));

    } catch (error) {
        console.error(error);
        dispatch(setSocketError({ socketConnection: false, msg: error.message }));
        dispatch(errorRequstAction(error.message));
    }

};

export { loadActiveChats };