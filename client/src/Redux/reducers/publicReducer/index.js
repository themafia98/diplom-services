import {
    SET_ERROR,
    SET_CACHE,
    SET_STATUS,
    SET_ACTIVE_CHAT_TOKEN,
    SHOW_GUIDE,
    UDATA_LOAD,
    CLEAR_CACHE
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
            let keys = null;

            const isObjects = typeof data === "object" && data !== null && Object.keys(data).length > 1;
            const isObjectsArray = isObjects && !Object.keys(data).every(key => isNaN(Number(key)));

            const validData = isObjectsArray ? Object.entries(data).map(([key, value]) => value).filter(Boolean) : data;

            if (validData.length > 1) {
                keys = [];
                validData.forEach(item => {
                    if (pk) {
                        keys.push(`${item.depKey}${item._id}${primaryKey}${pk}`);
                    } else keys.push(`${item.depKey}${item._id}${primaryKey}`);
                });

                keys = new Set(keys);
                const _items = {};

                let i = 0;
                keys.forEach(value => {
                    _items[value] = { ...validData[i] };
                    i += 1;
                });
                const { caches = {} } = state;
                return {
                    ...state,
                    caches: { ...caches, ..._items }
                };
            } else {
                keys =
                    validData && !Array.isArray(validData) && primaryKey && validData.depKey
                        ? `${validData.depKey}${validData._id}${primaryKey}`
                        : Array.isArray(validData) && primaryKey && validData[0].depKey && pk
                            ? `${validData[0].depKey}${validData[0]._id}${pk}`
                            : Array.isArray(validData)
                                ? validData[0].depKey
                                : validData.depKey;

                return {
                    ...state,
                    caches: { ...state.caches, [keys]: validData[0] ? { ...validData[0] } : validData }
                };
            }
        }

        case CLEAR_CACHE: {
            const deleteKey =
                action.payload.type === "itemTab" ? action.payload.path.split("__")[1] : action.payload.path;
            const currentActionTab = action.payload.type === "itemTab" ?
                action.payload.currentActionTab.split("__")[1] : action.payload.currentActionTab;
            const { caches = {} } = state || {};
            const copyCahes = { ...caches };


            if (currentActionTab === deleteKey) {
                const filterCaches = Object.keys(copyCahes).reduce((filterObj, key) => {
                    if (!key.includes(deleteKey)) {
                        filterObj[key] = copyCahes[key];
                    }
                    return filterObj;
                }, {});

                return {
                    ...state,
                    caches: filterCaches,
                }
            } else return {
                ...state,
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
