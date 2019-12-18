/** IE supports polyfills */
import "core-js/features";
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
import ErrorBoundary from "./Components/ErrorBoundary";
import store from "./Redux/store";

import Request from './Utils/xhr';

require("es6-promise").polyfill();

ReactDOM.render(
    <BrowserRouter basename={"/"}>
        <ErrorBoundary>
            <Provider store={store}>
                <IntlProvider locale={"ru"}>
                    <App rest = {new Request()} />
                </IntlProvider>
            </Provider>
        </ErrorBoundary>
    </BrowserRouter>,
    document.getElementById("root")
);

serviceWorker.register();
