/** Here action constants import */
import { SET_PARENT_SIZE, SET_LOGOUT_TABS } from "../../actions/tabActions/const";

const initialState = {
    parentSize: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_PARENT_SIZE: {
            return {
                ...state,
                parentSize: action.payload
            };
        }
        case SET_LOGOUT_TABS: {
            return {
                ...state,
                parentSize: null,
                childrenSize: null,
                flag: false
            };
        }
        default:
            return state;
    }
};
