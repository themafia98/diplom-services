import React from "react";
import { EventEmitter } from "events";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import ContentView from "../Components/ContentView/index";

describe("<ContentView />", () => {
    test("Should works with state", () => {
        const props = {
            dashboardStrem: new EventEmitter(),
            setCurrentTab: () => {},
            updateLoader: () => {},
            onErrorRequstAction: () => {},
            firebase: {},
            path: "mainModule",
        };
        const ContentViewWrapper = shallow(<ContentView {...props} />);

        toJson(ContentViewWrapper);
        expect(ContentViewWrapper.find("MainModule").prop("firebase")).toEqual(props.firebase);

        ContentViewWrapper.setState({ drawerView: true });
        expect(ContentViewWrapper.find("DrawerViewer").prop("visible")).toBeTruthy();

        ContentViewWrapper.setState({ drawerView: false });
        expect(ContentViewWrapper.find("DrawerViewer").prop("visible")).toEqual(false);
    });
});