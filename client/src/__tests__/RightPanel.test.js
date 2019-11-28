import React from "react";
import RightPanel from "../Components/HeaderView/RightPanel";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

describe("<RightPanel /> template", () => {
    test("should be render", () => {
        const RightPanelWrapper = shallow(<RightPanel onClick={() => {}} />);
        expect(RightPanelWrapper.find("Updater").prop("additionalClassName")).toEqual("updaterDefault");
        expect(toJson(RightPanelWrapper)).toMatchSnapshot();

        expect(RightPanelWrapper.find(".logout").simulate("click", [])).toBeTruthy();
    });
});
