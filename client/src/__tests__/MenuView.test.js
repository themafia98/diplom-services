import React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import config from "../config.json";

import MenuView from "../Components/MenuView/index";

describe("<MenuView />", () => {
    test("Should MenuView render with itemsMenu", () => {
        const props = {
            collapsed: true,
            cbOnCollapse: () => {},
            items: config.menu,
            cbMenuHandler: () => {},
            activeTabEUID: "MainModule",
            cbGoMain: () => {},
        };
        const MenuViewWrapper = shallow(<MenuView {...props} />);
        expect(toJson(MenuViewWrapper)).toMatchSnapshot();

        MenuViewWrapper.find(".menuItem").forEach(node => {
            expect(node.hasClass("menuItem")).toEqual(true);
            expect(node.exists()).toEqual(true);
        });

        expect(MenuViewWrapper.find("Menu").prop("defaultSelectedKeys")).toEqual([props.items[0].VALUE]);

        expect(MenuViewWrapper.find("Sider").simulate("click", []));
        expect(toJson(MenuViewWrapper)).toMatchSnapshot();
    });
});
