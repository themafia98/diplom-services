import {
    SET_PATH,
    ADD_TAB,
    SET_ACTIVE_TAB,
    REMOVE_TAB,
    LOGOUT,
    OPEN_PAGE_WITH_DATA,
    SAVE_STATE,
    SET_FLAG_LOAD_DATA,
} from "../../actions/routerActions/const";

const initialState = {
    position: "/",
    currentActionTab: "mainModule",
    actionTabs: [],
    routeDataActive: null,
    routeData: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_PATH:
            return {
                ...state,
                position: action.payload,
            };
        case ADD_TAB:
            return {
                ...state,
                actionTabs: [...state.actionTabs, action.payload],
                currentActionTab: action.payload,
            };
        case OPEN_PAGE_WITH_DATA: {
            const copyRouteData = { ...state.routeData };
            copyRouteData[action.payload.routeDataActive.key] = action.payload.routeDataActive;
            return {
                ...state,
                currentActionTab: action.payload.activePage,
                actionTabs: [...state.actionTabs, action.payload.activePage],
                routeDataActive: { ...action.payload.routeDataActive },
                routeData: copyRouteData,
            };
        }
        case SAVE_STATE: {
            const copyRouteData = { ...state.routeData };
            let path = action.payload.path;
            let pathParse = path.split("_");
            if (
                pathParse[0] === "taskModule" &&
                pathParse[1] &&
                (pathParse[1] === "myTasks" || pathParse[1] === "all")
            ) {
                path = pathParse[0];
            }
            copyRouteData[path] = action.payload;
            return {
                ...state,
                routeData: copyRouteData,
            };
        }
        case SET_FLAG_LOAD_DATA: {
            const copyRouteData = { ...state.routeData };
            copyRouteData[action.payload.path].load = action.payload.load;
            return {
                ...state,
                routeData: copyRouteData,
            };
        }
        case SET_ACTIVE_TAB: {
            const content = action.payload.split("__")[1];
            let currentActive = null;
            let isDataPage = false;
            if (content) {
                isDataPage = true;
                currentActive = state.routeData[content];
            }
            return {
                ...state,
                currentActionTab: action.payload,
                routeDataActive: isDataPage ? { ...currentActive } : { ...state.routeDataActive },
            };
        }
        case REMOVE_TAB: {
            let deleteKey =
                action.payload.type === "itemTab" ? action.payload.path.split("__")[1] : action.payload.path;
            const { currentActionTab } = state;
            let deleteKeyOnce = !deleteKey ? action.payload.path : null;
            const filterArray = state.actionTabs.filter((tab, i) => {
                if (
                    deleteKey &&
                    ((action.payload.type === "itemTab" &&
                        tab.includes(action.payload.path.split("__")[1]) &&
                        action.payload.path.split("__")[1] === deleteKey) ||
                        (!tab.split("__")[1] && tab.includes(action.payload.path)))
                )
                    return false;
                return tab !== action.payload;
            });

            const keys = Object.keys(state.routeData);
            const routeDataNew = {};

            for (let i = 0; i < keys.length; i++) {
                if (
                    (action.payload.type === "itemTab" && state.routeData[keys[i]].key !== deleteKey) ||
                    !keys[i].includes(deleteKey)
                ) {
                    routeDataNew[keys[i]] = { ...state.routeData[keys[i]] };
                }
            }

            const indexFind = state.actionTabs.findIndex(it => it === state.currentActionTab);
            const currentFind = filterArray.findIndex(tab => tab === currentActionTab);
            const nextTab = currentFind !== -1 ? currentActionTab : filterArray[indexFind - 1];

            const uuid =
                typeof nextTab === "string" && action.payload.type === "itemTab" ? nextTab.split("__")[1] : nextTab;

            const copyData = routeDataNew;
            return {
                ...state,
                currentActionTab: nextTab || "mainModule",
                actionTabs: filterArray,
                routeDataActive:
                    state.routeDataActive && deleteKey === state.routeDataActive.key && uuid && !deleteKeyOnce
                        ? routeDataNew[uuid]
                        : deleteKeyOnce && uuid
                        ? { ...state.routeData[uuid] }
                        : nextTab === state.currentActionTab && uuid
                        ? { ...state.routeData[uuid] }
                        : nextTab === state.currentActionTab
                        ? { ...state.routeDataActive }
                        : null,
                routeData: copyData,
            };
        }
        case LOGOUT: {
            return {
                ...state,
                position: "/",
                currentActionTab: "mainModule",
                actionTabs: [],
            };
        }
        default:
            return state;
    }
};
