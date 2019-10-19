/** Here action constants import */
import { SET_PARENT_SIZE, SET_CHILDREN_SIZE } from "../../actions/tabActions/const";

const initialState = {
    parentSize: null,
    childrenSize: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_PARENT_SIZE: {
            return {
                ...state,
                parentSize: action.payload,
            };
        }
        case SET_CHILDREN_SIZE: {
            return {
                ...state,
                childrenSize: action.payload,
            };
        }
        default:
            return state;
    }
};
