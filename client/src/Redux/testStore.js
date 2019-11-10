import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import firebase from "../delayFirebase/Firebase";

/** stores for  jest */

const initialState = {
    tabReducer: {
        parentSize: null,
        childrenSize: null,
        flag: false,
    },
    publicReducer: {
        status: "online",
        prewStatus: "online",
        requestError: null,
        caches: {},
    },
    router: {
        currentActionTab: "mainModule",
        actionTabs: ["MainModule"],
        routeDataActive: null,
        routeData: {},
    },
};

const middlewares = [thunk.withExtraArgument({ firebase })]; /** test middlewares */
const mockStore = configureStore(middlewares); /** test config store */

const store = mockStore(initialState); /** init test store */

export default store;
