import { combineReducers } from "redux";
import tabReducer from "./tabReducer";
import publicReducer from "./publicReducer";
import routerStateReducer from "./routerStateReducer";

export default combineReducers({
    publicReducer: publicReducer,
    tabReducer: tabReducer,
    router: routerStateReducer,
});
