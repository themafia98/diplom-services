import React from "react";
import { Provider } from "react-redux";
import { shallow } from "enzyme";

import App from "../App";
import firebase from "../delayFirebase/Firebase";
import firebaseContext from "../delayFirebase/firebaseContext";
import store from "../Redux/store";

import Loader from "../Components/Loader";
it("App test", () => {
    const AppWrapper = shallow(
        <firebaseContext.Provider value={firebase}>
            <Provider store={store}>
                <firebaseContext.Consumer>{firebase => <App firebase={firebase} />}</firebaseContext.Consumer>
            </Provider>
        </firebaseContext.Provider>,
    );

    expect(AppWrapper.contains(<Loader />)).toEqual(false);
});
