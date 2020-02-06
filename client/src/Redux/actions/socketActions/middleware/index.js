import { setSocketConnection, onLoadActiveChats } from "../";

/**
 * Middleware
 * @param {object} payload chats loading options
 * @param {object} schema - validator
 * @param {object} Request - http requests
 * @param {clientDB} clientDB - IndexedDB methods 
 */

const loadActiveChats = payload => async (dispatch, getState, { schema, Request, clientDB }) => {
    debugger;

    const {
        type = "",
        action = "",
        options: {
            limitList = null,
            socket: {
                socketConnection = false,
                module: activeModule = "chat"
            } = {}
        } = {}
    } = payload || {};

    if ((!type || !action) && socketConnection && activeModule) {
        dispatch(setSocketConnection({ socketConnection, activeModule }));
        return;
    }
};

export { loadActiveChats };