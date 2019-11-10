import React from "react";
import { Provider } from "react-redux";
import { shallow } from "enzyme";

import toJson from "enzyme-to-json";
import App from "../App";
import store from "../Redux/testStore";

it("App test", () => {
    const AppWrapper = shallow(
        <Provider store={store}>
            <App firebase={{}} />
        </Provider>,
    );

    expect(toJson(AppWrapper)).toMatchSnapshot();
});
