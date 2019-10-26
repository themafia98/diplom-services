import { SET_PATH, ADD_TAB, SET_ACTIVE_TAB, REMOVE_TAB, LOGOUT, OPEN_PAGE_WITH_DATA, SAVE_STATE } from "./const";
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

export const openPageWithDataAction = state => {
    return {
        type: OPEN_PAGE_WITH_DATA,
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

export const saveComponentStateAction = state => {
    return {
        type: SAVE_STATE,
        payload: state,
    };
};

export const logoutAction = state => {
    return dispatch => {
        dispatch(setLogoutTabs());
        dispatch(logoutRouterAction());
    };
};
