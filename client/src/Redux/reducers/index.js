import { combineReducers } from "redux";
import publicReducer from "./publicReducer";
import routerStateReducer from "./routerStateReducer";

export default combineReducers({
    public: publicReducer,
    router: routerStateReducer,
});
