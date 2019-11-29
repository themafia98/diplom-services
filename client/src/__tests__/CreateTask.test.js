import React from "react";
import toJson from "enzyme-to-json";
import { shallow } from "enzyme";

import CreateTask from "../Components/Modules/TaskModule/CreateTask";

describe("<CreateTask /> template", () => {
    test("Should be render", () => {
        const props = {
            height: 800,
            onLoadCurrentData: () => {},
            firebase: {},
            statusApp: "online"
        };

        const CreateTaskWrapper = shallow(<CreateTask {...props} />);
        expect(toJson(CreateTaskWrapper)).toMatchSnapshot();

        expect(CreateTaskWrapper.find(".submitNewTask").prop("loading")).toEqual(false);
        expect(CreateTaskWrapper.find(".submitNewTask").prop("disabled")).toEqual(false);

        expect(CreateTaskWrapper.find(".submitNewTask").simulate("click", [])).toBeTruthy();

        CreateTaskWrapper.setState({ load: true });

        expect(CreateTaskWrapper.find(".submitNewTask").prop("loading")).toEqual(CreateTaskWrapper.state().load);
        expect(CreateTaskWrapper.find(".submitNewTask").prop("disabled")).toEqual(CreateTaskWrapper.state().load);

        expect(CreateTaskWrapper.find(".submitNewTask").simulate("click", [])).toBeTruthy();

        expect(toJson(CreateTaskWrapper)).toMatchSnapshot();

        expect(CreateTaskWrapper.find("PickerWrapper").simulate("click", [])).toBeTruthy();
    });
});
