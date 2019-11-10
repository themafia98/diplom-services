import React from "react";
import { Provider } from "react-redux";
import { EventEmitter } from "events";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import HeaderView from "../Components/HeaderView/index";
import store from "../Redux/testStore";
it("HeaderView test", () => {
    const props = {
        dashboardStrem: new EventEmitter(),
        cbMenuTabHandler: () => {},
        actionTabs: ["mainModule"],
        activeTabEUID: "mainModule",
        logout: () => {},
    };

    const HeaderViewWrapper = shallow(<HeaderView store={store} {...props} />);

    expect(toJson(HeaderViewWrapper)).toMatchSnapshot();
});
