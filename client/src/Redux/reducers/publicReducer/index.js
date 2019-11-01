import { SET_ERROR, SET_CACHE } from "../../actions/publicActions/const";

const initialState = {
    requestError: null,
    caches: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ERROR: {
            return {
                ...state,
                requestError: Array.isArray(state.requestError)
                    ? [...state.requestError, action.payload]
                    : [action.payload],
            };
        }
        case SET_CACHE: {
            const key = action.payload.key;
            return {
                ...state,
                caches: { ...state.caches, [key]: { ...action.payload } },
            };
        }
        default:
            return state;
    }
};
