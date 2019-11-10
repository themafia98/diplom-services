import React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import Comments from "../Components/Comments/index";

it("Comments test", () => {
    const props = {
        rules: true,
        data: {
            key: "sad",
            comments: [
                {
                    id: "213123",
                    time: "DD.MM.YYYY HH:mm",
                    username: "Павел Петрович",
                    message: "sadasdasdas",
                },
            ],
        },
        onUpdate: () => {},
    };
    const CommentsWrapper = shallow(<Comments {...props} />);
    expect(toJson(CommentsWrapper)).toMatchSnapshot();

    CommentsWrapper.setState({ onUpdateDisabled: true });
    expect(CommentsWrapper.find(".sendCommentsButton").prop("disabled")).toEqual(true);
    expect(CommentsWrapper).toMatchSnapshot();

    CommentsWrapper.setState({ onUpdateDisabled: false });
    expect(CommentsWrapper.find(".sendCommentsButton").prop("disabled")).toEqual(false);
    expect(CommentsWrapper).toMatchSnapshot();

    expect(CommentsWrapper.find(".sendCommentsButton").prop("disabled")).toEqual(false);

    expect(CommentsWrapper.find(".sendCommentsButton").simulate("click", []));
    expect(CommentsWrapper).toMatchSnapshot();

    expect(CommentsWrapper.find("Comment")).toHaveLength(1);
});
