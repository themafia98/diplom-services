import { SET_PARENT_SIZE, SET_CHILDREN_SIZE, SET_LOGOUT_TABS } from "./const";

export const setParentSizeAction = state => {
    return {
        type: SET_PARENT_SIZE,
        payload: state,
    };
};

export const setChildrenSizeAction = state => {
    return {
        type: SET_CHILDREN_SIZE,
        payload: state,
    };
};

export const setLogoutTabs = state => {
    return {
        type: SET_LOGOUT_TABS,
        payload: state,
    };
};