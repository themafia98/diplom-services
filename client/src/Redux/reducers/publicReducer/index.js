import {
    SET_ERROR,
    SET_CACHE,
    SET_STATUS,
    SET_ACTIVE_CHAT_TOKEN,
    SHOW_GUIDE,
    UDATA_LOAD
} from "../../actions/publicActions/const";

const initialState = {
    status: "online",
    prewStatus: "online",
    firstConnect: false,
    requestError: null,
    udata: {},
    chat: { chatToken: null },
    caches: {}
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
                            : null
            };
        }

        case UDATA_LOAD: {
            const { payload = {} } = action;
            return {
                ...state,
                udata: { ...payload }
            };
        }

        case SHOW_GUIDE: {
            return {
                ...state,
                firstConnect: action.payload
            };
        }

        case SET_ACTIVE_CHAT_TOKEN: {
            return {
                ...state,
                chat: {
                    ...state.chat,
                    chatToken: action.payload.token || { chatToken: null },
                    listdata: action.payload.listdata ? [...action.payload.listdata] : []
                }
            };
        }
        case SET_CACHE: {
            const { primaryKey } = action.payload;
            const { pk = null } = action.payload;
            const { data } = action.payload;
            debugger;
            let keys = null;

            if (data.length > 1) {
                keys = [];
                data.forEach(item => {
                    if (pk) {
                        keys.push(`${item.depKey}${item._id}${primaryKey}${pk}`);
                    } else keys.push(`${item.depKey}${item._id}${primaryKey}`);
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
                    caches: { ..._items }
                };
            } else {
                keys =
                    data && !Array.isArray(data) && primaryKey && data.depKey
                        ? `${data.depKey}${data._id}${primaryKey}`
                        : Array.isArray(data) && primaryKey && data[0].depKey && pk
                            ? `${data[0].depKey}${data[0]._id}${pk}`
                            : Array.isArray(data)
                                ? data[0].depKey
                                : data.depKey;
                return {
                    ...state,
                    caches: { ...state.caches, [keys]: data[0] ? { ...data[0] } : data }
                };
            }
        }
        case SET_STATUS: {
            const { statusRequst = state.status } = action.payload;
            return {
                ...state,
                status: statusRequst,
                prewStatus: state.status
            };
        }
        default:
            return state;
    }
};
