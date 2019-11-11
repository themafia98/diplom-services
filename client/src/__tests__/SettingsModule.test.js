import React from "react";
import toJson from "enzyme-to-json";
import { shallow } from "enzyme";

import { initialState } from "../Redux/testStore";
import { SettingsModule } from "../Components/Modules/SettingsModule";

describe("<SettingsModule /> template", () => {
    test("Should be render", () => {
        const props = {
            onErrorRequstAction: () => {},
            path: "settingsModule",
            firebase: {},
            onSaveComponentState: () => {},
            router: { ...initialState.router },
        };

        const SettingsModuleWrapper = shallow(<SettingsModule {...props} />);
        expect(toJson(SettingsModuleWrapper)).toMatchSnapshot();

        expect(SettingsModuleWrapper.find(".submit").prop("disabled")).toEqual(true);
        expect(SettingsModuleWrapper.find(".submit").simulate("click", [])).toBeTruthy();

        const arrayPanel = SettingsModuleWrapper.find("Collapse");

        arrayPanel.forEach((node, i) => {
            if (i === 0) expect(node.prop("bordered")).toEqual(true);
            else expect(node.prop("bordered")).toEqual(false);

            expect(node.simulate("click", []));
        });

        SettingsModuleWrapper.setState({ hasChange: true });
        expect(SettingsModuleWrapper.find(".submit")).toEqual({});

        expect(toJson(SettingsModuleWrapper)).toMatchSnapshot();
    });
});
