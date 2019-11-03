import { SET_ERROR, SET_CACHE, SET_STATUS } from "../../actions/publicActions/const";

const initialState = {
    status: "online",
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
            const { primaryKey } = action.payload;
            const { data } = action.payload;
            const key = data && primaryKey && data.key ? `${data.key}${primaryKey}` : data.key;
            return {
                ...state,
                caches: { ...state.caches, [key]: { ...data } },
            };
        }
        case SET_STATUS: {
            return {
                ...state,
                sattus: action.payload,
            };
        }
        default:
            return state;
    }
};
