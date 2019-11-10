import React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

import TableView from "../Components/TableView/index";
import store from "../Redux/testStore";

it("TableView test", () => {
    const props = {
        setCurrentTab: () => {},
        height: 150,
        tasks: [],
        path: "mainModule__table",
        firebase: {},
        data: {},
        flag: true,
        user: {},
        router: {},
        publicReducer: {},
    };

    const TableViewWrapper = mount(
        <Provider store={store}>
            <TableView {...props} />
        </Provider>,
    );

    expect(toJson(TableViewWrapper)).toMatchSnapshot();

    const nextPropsPath = {
        ...props,
        path: "searchTable",
    };

    const TableViewWrapperSearch = mount(
        <Provider store={store}>
            <TableView {...nextPropsPath} />
        </Provider>,
    );

    expect(TableViewWrapperSearch.find(".author").simulate("click", []));
    expect(toJson(TableViewWrapperSearch)).toMatchSnapshot();
});
