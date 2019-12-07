/** IE supports polyfills */
import "core-js/es/map";
import "core-js/es/string/starts-with";
import "core-js/es/set";
import "core-js/es/symbol";
import "core-js/es/array/find-index";
import "core-js/es/object/entries";
import "core-js/es/array/includes";
import "core-js/es/array/from";
import "core-js/es/array/find";
import "core-js/es/string/includes";
import "core-js/es/object/assign";
/** --------------------- */

import React from "react";
import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import ReactDOM from "react-dom";

import "normalize.css";
import "antd/dist/antd.css";
import "./index.scss";
import "./Utils/styles/fontello.css";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

import firebase from "./delayFirebase/Firebase";
// import firebaseContext from "./delayFirebase/firebaseContext";
import ErrorBoundary from "./Components/ErrorBoundary";

import store from "./Redux/store";

require("es6-promise/auto");

ReactDOM.render(
    <BrowserRouter basename={"/"}>
        <ErrorBoundary>
            <Provider store={store}>
                <IntlProvider locale={"ru"}>
                    <App firebase={firebase} />
                </IntlProvider>
            </Provider>
        </ErrorBoundary>
    </BrowserRouter>,
    document.getElementById("root")
);
serviceWorker.register();
