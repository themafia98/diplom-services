import { SET_PATH, ADD_TAB, SET_ACTIVE_TAB } from './const';


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
    }
};