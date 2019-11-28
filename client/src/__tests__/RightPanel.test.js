import React from "react";
import RightPanel from "../Components/HeaderView/RightPanel";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

describe("<RightPanel /> template", () => {
    test("should be render", () => {
        const props = {
            onUpdate: () => {},
            onClick: () => {}
        };
        const RightPanelWrapper = shallow(<RightPanel {...props} />);
        expect(RightPanelWrapper.find("Updater").prop("additionalClassName")).toEqual("updaterDefault");
        expect(toJson(RightPanelWrapper)).toMatchSnapshot();

        expect(RightPanelWrapper.find(".logout").simulate("click", [])).toBeTruthy();
    });
});
