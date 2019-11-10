import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import firebase from "../delayFirebase/Firebase";

/** stores for  jest */

const initialState = {
    tabReducer: {},
    router: { actionTabs: ["MainModule"] },
};

const middlewares = [thunk.withExtraArgument({ firebase })]; /** test middlewares */
const mockStore = configureStore(middlewares); /** test config store */

const store = mockStore(initialState); /** init test store */

export default store;
