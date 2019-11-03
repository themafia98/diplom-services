import { createStore, applyMiddleware, compose } from "redux";
import { getSchema, Request } from "../Utils";
import firebase from "../delayFirebase/Firebase";
import thunk from "redux-thunk";
import combineReducers from "./reducers";

const request = new Request();

/** For devtools */
const composeEnhancers =
    typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
        : compose;

const middleware = composeEnhancers(
    /** @Include moddleware */
    applyMiddleware(thunk.withExtraArgument({ firebase, getSchema, request })),
);

const store = createStore(combineReducers, middleware);
export default store;
