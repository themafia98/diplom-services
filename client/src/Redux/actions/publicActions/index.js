/** Here action constants import */
import { SET_ERROR, SET_CACHE, SET_STATUS, SET_ACTIVE_CHAT_TOKEN, SHOW_GUIDE, UDATA_LOAD } from "./const";

export const errorRequstAction = state => {
    return {
        type: SET_ERROR,
        payload: state
    };
};

export const showGuile = state => {
    return {
        type: SHOW_GUIDE,
        payload: state
    };
};

export const loadUdata = state => {
    return {
        type: UDATA_LOAD,
        payload: state
    };
};

export const setActiveChatToken = state => {
    return {
        type: SET_ACTIVE_CHAT_TOKEN,
        payload: state
    };
};

export const сachingAction = state => {
    return {
        type: SET_CACHE,
        payload: state
    };
};

export const setStatus = state => {
    return {
        type: SET_STATUS,
        payload: state
    };
};
