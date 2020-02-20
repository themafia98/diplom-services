import {
    setSocketConnection,
    onLoadActiveChats,
    setSocketError,
    setActiveChatToken
} from "../";

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
        actionPath = "",
        actionType = "",
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

        if ((!path || !actionPath) && socketConnection && activeModule) {
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
            actionPath,
            actionType,
            queryParams: {
                ...options
            }
        }, true);

        if (!response || response.status !== 200) {
            throw new Error(`Invalid load action (${actionPath}) options`);
        }

        const { data: { response: { metadata: listdata = [] } = {} } } = response || {};

        const { udata: { _id: uidState = "" } = {} } = getState().publicReducer || {};

        dispatch(onLoadActiveChats({
            usersList: usersList.filter(user => user._id !== uidState),
            listdata,
            options
        }));

    } catch (error) {
        console.error(error);
        dispatch(setSocketError({ socketConnection: false, msg: error.message }));
        dispatch(errorRequstAction(error.message));
    }

};

export const loadingDataByToken = (token, listdata, activeModule, isFake = null) =>
    async (dispatch, getState, { schema, Request, clientDB }) => {
        try {

            if (isFake) {
                dispatch(setActiveChatToken({ listdata: [], tokenRoom: `${token}__fakeRoom`, isFake }));
                return;
            }

            const rest = new Request();

            const configToken = listdata.find(config => config && config.tokenRoom === token) || null;

            if (!configToken) {
                throw new Error("Bad config token");
            }

            const options = Object.keys(configToken).reduce((optionsObj, key) => {

                if (key !== "_id" && key !== "type") {
                    optionsObj[key] = configToken[key];
                    return optionsObj;
                }
                return optionsObj;
            }, {});

            const res = await rest.sendRequest(`/${activeModule}/load/tokenData`, "POST", {
                queryParams: {
                    tokenRoom: token,
                    options
                }
            }, true);

            if (!res || res.status !== 200) {
                throw new Error(`Invalid load in module ${activeModule} action tokenData`);
            }

            const { data: { response: { metadata: listdataMsgs = [] } = {} } } = res || {};


            dispatch(setActiveChatToken({ listdataMsgs, tokenRoom: token }));

        } catch (error) {
            console.error(error.message);
            dispatch(errorRequstAction(error.message));
        }

    };

export { loadActiveChats };