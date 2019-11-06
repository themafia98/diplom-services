import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import ReactDOM from "react-dom";

import "normalize.css";
import "antd/dist/antd.css";
import "./index.scss";
import "./Utils/styles/fontello.css";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import * as Sentry from "@sentry/browser";

import firebase from "./delayFirebase/Firebase";
import firebaseContext from "./delayFirebase/firebaseContext";
import ErrorBoundary from "./Components/ErrorBoundary";

import store from "./Redux/store";

Sentry.init({ dsn: process.env.REACT_APP_LOGGER_DSN });

ReactDOM.render(
    <BrowserRouter basename={"/"}>
        <ErrorBoundary>
            <firebaseContext.Provider value={firebase}>
                <Provider store={store}>
                    <firebaseContext.Consumer>{firebase => <App firebase={firebase} />}</firebaseContext.Consumer>
                </Provider>
            </firebaseContext.Provider>
        </ErrorBoundary>
    </BrowserRouter>,
    document.getElementById("root"),
);
serviceWorker.register();
