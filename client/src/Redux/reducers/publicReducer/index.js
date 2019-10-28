import { SET_ERROR } from "../../actions/publicActions/const";

const initialState = {
    requestError: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ERROR: {
            return {
                ...state,
                requestError: action.payload ? action.payload : null,
            };
        }
        default:
            return state;
    }
};
