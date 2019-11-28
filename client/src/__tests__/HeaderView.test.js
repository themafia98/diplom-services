import React from "react";
import { EventEmitter } from "events";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import { HeaderView } from "../Components/HeaderView/index";
import { initialState } from "../Redux/testStore";

describe("<HeaderView /> and children", () => {
    test("Should render", () => {
        const props = {
            ...initialState,
            dashboardStrem: new EventEmitter(),
            cbMenuTabHandler: () => {},
            actionTabs: [{ EUID: "mainModule" }],
            activeTabEUID: "mainModule",
            logout: () => {}
        };

        const HeaderViewWrapper = shallow(<HeaderView {...props} />);
        expect(toJson(HeaderViewWrapper)).toMatchSnapshot();

        expect(HeaderViewWrapper.find(".tabsMenu").exists()).toBeTruthy();

        const nextProps = {
            ...props,
            actionTabs: [{ EUID: "mainModule1" }]
        };

        const HeaderViewWrapperNewProps = shallow(<HeaderView {...nextProps} />);
        expect(HeaderViewWrapperNewProps).toMatchSnapshot();
    });
});
