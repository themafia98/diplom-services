import { combineReducers } from "redux";
import publicReducer from "./publicReducer";
import router from "./routerStateReducer";
import socketReducer from "./socketReducer";

export default combineReducers({
    publicReducer,
    router,
    socketReducer
});
