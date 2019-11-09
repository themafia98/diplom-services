import { SET_ERROR, SET_CACHE, SET_STATUS } from "../../actions/publicActions/const";

const initialState = {
    status: "online",
    prewStatus: "online",
    requestError: null,
    caches: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ERROR: {
            return {
                ...state,
                requestError:
                    action.payload && Array.isArray(state.requestError)
                        ? [...state.requestError, action.payload]
                        : action.payload
                        ? [action.payload]
                        : null,
            };
        }
        case SET_CACHE: {
            const { primaryKey } = action.payload;
            const { pk = null } = action.payload;
            const { data } = action.payload;

            let keys = null;

            if (data.length > 1) {
                keys = [];
                data.forEach(item => {
                    if (pk) {
                        keys.push(`${item.key}${item.id}${primaryKey}${pk}`);
                    } else keys.push(`${item.key}${item.id}${primaryKey}`);
                });

                keys = new Set(keys);
                const _items = {};

                let i = 0;
                keys.forEach(value => {
                    _items[value] = { ...data[i] };
                    i += 1;
                });

                return {
                    ...state,
                    caches: { ..._items },
                };
            } else {
                keys =
                    data && !Array.isArray(data) && primaryKey && data.key
                        ? `${data.key}${data.id}${primaryKey}`
                        : Array.isArray(data) && primaryKey && data[0].key && pk
                        ? `${data[0].key}${data[0].id}${pk}`
                        : Array.isArray(data)
                        ? data[0].key
                        : data.key;
                return {
                    ...state,
                    caches: { ...state.caches, [keys]: data[0] ? { ...data[0] } : data },
                };
            }
        }
        case SET_STATUS: {
            return {
                ...state,
                status: action.payload,
                prewStatus: state.status,
            };
        }
        default:
            return state;
    }
};
