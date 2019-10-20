import { SET_PATH, ADD_TAB, SET_ACTIVE_TAB, REMOVE_TAB, LOGOUT } from "./const";
import { setLogoutTabs } from "../tabActions";

export const updatePathAction = state => {
    return {
        type: SET_PATH,
        payload: state,
    };
};

export const addTabAction = state => {
    return {
        type: ADD_TAB,
        payload: state,
    };
};

export const setActiveTabAction = state => {
    return {
        type: SET_ACTIVE_TAB,
        payload: state,
    };
};

export const removeTabAction = state => {
    return {
        type: REMOVE_TAB,
        payload: state,
    };
};

export const logoutRouterAction = state => {
    return {
        type: LOGOUT,
        payload: state,
    };
};

export const logoutAction = state => {
    return dispatch => {
        dispatch(setLogoutTabs());
        dispatch(logoutRouterAction());
    };
};
