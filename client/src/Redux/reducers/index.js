import { combineReducers } from "redux";
import tabReducer from "./tabReducer";
import routerStateReducer from "./routerStateReducer";

export default combineReducers({
    tabReducer: tabReducer,
    router: routerStateReducer,
});
