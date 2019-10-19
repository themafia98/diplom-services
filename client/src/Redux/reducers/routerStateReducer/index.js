import { SET_PATH, ADD_TAB, SET_ACTIVE_TAB, REMOVE_TAB } from "../../actions/routerActions/const";

const initialState = {
    position: "/",
    currentActionTab: "mainModule",
    actionTabs: [],
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
        case SET_ACTIVE_TAB:
            return {
                ...state,
                currentActionTab: action.payload,
            };
        case REMOVE_TAB: {
            let index = 0;
            const filterArray = state.actionTabs.filter((tab, i) => {
                if (tab !== action.payload) index = i;
                return tab !== action.payload;
            });
            return {
                ...state,
                currentActionTab:
                    state.currentActionTab === action.payload
                        ? filterArray[index !== 0 ? index - 1 : 0]
                        : state.currentActionTab,
                actionTabs: filterArray,
            };
        }
        default:
            return state;
    }
};
