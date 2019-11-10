import React from "react";
import { Provider } from "react-redux";
import { EventEmitter } from "events";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

import HeaderView from "../Components/HeaderView/index";
import store from "../Redux/testStore";
it("HeaderView test", () => {
    const props = {
        dashboardStrem: new EventEmitter(),
        cbMenuTabHandler: () => {},
        actionTabs: [{ EUID: "mainModule" }],
        activeTabEUID: "mainModule",
        logout: () => {},
    };

    const HeaderViewWrapper = mount(
        <Provider store={store}>
            <HeaderView {...props} />
        </Provider>,
    );
    expect(toJson(HeaderViewWrapper)).toMatchSnapshot();

    expect(HeaderViewWrapper.find("Updater").simulate("click", []));
    expect(toJson(HeaderViewWrapper)).toMatchSnapshot();

    expect(HeaderViewWrapper.find("Updater").prop("additionalClassName")).toEqual("updaterDefault");

    expect(HeaderViewWrapper.find("Tab").prop("flag")).toEqual(true);
    expect(HeaderViewWrapper.find("Tab").prop("sizeTab")).toEqual(160);
    expect(HeaderViewWrapper.find("Tab").prop("active")).toEqual(true);

    const nextProps = {
        ...props,
        actionTabs: [{ EUID: "mainModule1" }],
    };

    const HeaderViewWrapperNewProps = mount(
        <Provider store={store}>
            <HeaderView {...nextProps} />
        </Provider>,
    );

    expect(HeaderViewWrapperNewProps.find("Tab").prop("active")).toEqual(false);
});
