import React from "react";
import config from "../../../config.json";
import { Layout, message } from "antd";
import { connect } from "react-redux";
import {
    updatePathAction,
    addTabAction,
    setActiveTabAction,
    removeTabAction,
    logoutAction,
} from "../../../Redux/actions/routerActions";

import { setChildrenSizeAction } from "../../../Redux/actions/tabActions";

import HeaderView from "../../HeaderView";
import ContentView from "../../ContentView";
import MenuView from "../../MenuView";

class UserPanel extends React.PureComponent {
    state = {
        collapsed: false,
        menuItems: config.menu,
    };

    onCollapse = collapsed => {
        this.setState({ ...this.state, collapsed });
    };

    logout = event => {
        const { firebase, onLogoutAction } = this.props;
        if (firebase) firebase.signOut().then(() => onLogoutAction().then(() => this.props.history.push("/")));
    };

    getActionTabs = (tabs = [], menu) => {
        const { router: { routeData = {} } = {} } = this.props;
        const tabsCopy = [...tabs];
        const tabsArray = [];
        for (let i = 0; i < tabsCopy.length; i++) {
            let tabItem = menu.find(tab => tab.EUID === tabsCopy[i]);
            if (!tabItem) {
                const dataPage = tabsCopy[i].split("__");
                const PARENT_CODE = dataPage[0];
                const DATAKEY = dataPage[1];
                const VALUE = routeData[DATAKEY].name;
                tabItem = { EUID: tabsCopy[i], PARENT_CODE, DATAKEY, VALUE };
            }
            if (tabItem) tabsArray.push({ ...tabItem });
        }
        return tabsArray;
    };

    goHome = event => {
        const { setCurrentTab } = this.props;
        setCurrentTab("mainModule");
    };

    menuHandler = (event, key, mode = "open") => {
        const path = event["key"] ? event["key"] : key;
        const {
            router: { currentActionTab, actionTabs = [] } = {},
            addTab,
            setCurrentTab,
            removeTab,
            tabData,
            onSetChildrenSizeAction,
        } = this.props;
        const actionTabsCopy = [...actionTabs];
        const isFind = actionTabsCopy.findIndex(tab => tab === path) !== -1;
        if (mode === "open") {
            if (!isFind && config.tabsLimit <= actionTabsCopy.length)
                return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
            if (!isFind) addTab(path);
            else if (currentActionTab !== path) {
                setCurrentTab(path);
            }
        } else if (mode === "close") {
            let size = tabData.parentSize / actionTabsCopy.length;
            if (size > 160) size = 160;

            if (isFind) removeTab(path);
            if (size !== tabData.childrenSize) onSetChildrenSizeAction(size, true);
        }
    };

    render() {
        const { menuItems = null } = this.state;
        const { router: { actionTabs = [], currentActionTab } = {}, firebase } = this.props;

        const actionTabsData = this.getActionTabs(actionTabs, menuItems);

        return (
            <Layout className="layout_menu">
                <MenuView
                    items={menuItems}
                    activeTabEUID={currentActionTab}
                    cbMenuHandler={this.menuHandler}
                    collapsed={this.state.collapsed}
                    cbOnCollapse={this.onCollapse}
                    cbGoMain={this.goHome}
                />
                <Layout>
                    <HeaderView
                        cbMenuTabHandler={this.menuHandler}
                        activeTabEUID={currentActionTab}
                        actionTabs={actionTabsData}
                        logout={this.logout}
                    />
                    <ContentView firebase={firebase} key="contentView" path={currentActionTab} />
                </Layout>
            </Layout>
        );
    }
}

const mapStateToProps = state => {
    return {
        router: { ...state.router },
        tabData: state.tabReducer,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        moveTo: async path => await dispatch(updatePathAction(path)),
        addTab: tab => dispatch(addTabAction(tab)),
        removeTab: tab => dispatch(removeTabAction(tab)),
        setCurrentTab: tab => dispatch(setActiveTabAction(tab)),
        onSetChildrenSizeAction: (size, flag) => dispatch(setChildrenSizeAction(size, flag)),
        onLogoutAction: async () => await dispatch(logoutAction()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(UserPanel);
