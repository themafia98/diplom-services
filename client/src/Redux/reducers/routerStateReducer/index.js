import {
    SET_PATH,
    ADD_TAB,
    SET_ACTIVE_TAB,
    REMOVE_TAB,
    LOGOUT,
    OPEN_PAGE_WITH_DATA,
} from "../../actions/routerActions/const";

const initialState = {
    position: "/",
    currentActionTab: "mainModule",
    actionTabs: [],
    routeDataActive: null,
    routeData: [],
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
            return {
                ...state,
                currentActionTab: action.payload.activePage,
                actionTabs: [...state.actionTabs, action.payload.activePage],
                routeDataActive: { ...action.payload.routeDataActive },
                routeData: [...state.routeData, { ...action.payload.routeDataActive }],
            };
        }
        case SET_ACTIVE_TAB:
            return {
                ...state,
                currentActionTab: action.payload,
            };
        case REMOVE_TAB: {
            let index = 0;
            const filterArray = state.actionTabs.filter((tab, i) => {
                if (tab === action.payload) index = i;
                return tab !== action.payload;
            });
            return {
                ...state,
                currentActionTab:
                    filterArray[index >= filterArray.length && index !== 0 ? filterArray.length - 1 : index],
                actionTabs: filterArray,
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
