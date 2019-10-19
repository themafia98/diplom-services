import { SET_PARENT_SIZE, SET_CHILDREN_SIZE } from "./const";

export const setparentSizeAction = state => {
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
