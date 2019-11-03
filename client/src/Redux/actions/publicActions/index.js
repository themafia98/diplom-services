/** Here action constants import */
import { SET_ERROR, SET_CACHE, SET_STATUS } from "./const";

export const errorRequstAction = state => {
    return {
        type: SET_ERROR,
        payload: state,
    };
};

export const сachingAction = state => {
    return {
        type: SET_CACHE,
        payload: state,
    };
};

export const setStatus = state => {
    return {
        type: SET_STATUS,
        payload: state,
    };
};
