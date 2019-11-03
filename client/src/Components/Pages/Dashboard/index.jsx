import React from "react";
import { EventEmitter } from "events";
import _ from "lodash";
import config from "../../../config.json";
import { Layout, message, notification } from "antd";
import { connect } from "react-redux";
import {
    updatePathAction,
    addTabAction,
    setActiveTabAction,
    removeTabAction,
    logoutAction,
} from "../../../Redux/actions/routerActions";
import { loadCurrentData } from "../../../Redux/actions/routerActions/middleware";
import { errorRequstAction } from "../../../Redux/actions/publicActions";
import { setChildrenSizeAction } from "../../../Redux/actions/tabActions";

//import clientDB from "../../../clientDB";

import Loader from "../../Loader";
import HeaderView from "../../HeaderView";
import ContentView from "../../ContentView";
import MenuView from "../../MenuView";

class Dashboard extends React.PureComponent {
    state = {
        collapsed: false,
        status: "online",
        menuItems: config.menu,
        showLoader: false,
    };

    dashboardStrem = new EventEmitter();

    componentDidUpdate = () => {
        const {
            onErrorRequstAction,
            publicReducer: { requestError = null, status } = {},
            router,
            router: { currentActionTab },
        } = this.props;
        const { showLoader, status: statusState } = this.state;

        if (!showLoader && statusState !== status && status === "online")
            notification.success({ message: "Удачно", description: "Интернет соединение восстановлено." });

        if (showLoader && _.isNull(requestError) && status === "online") {
            const { routeData = {} } = router;
            const copyRouteData = { ...routeData };
            let currentArray = currentActionTab.split("_" || "__");
            let regExp = new RegExp(currentArray[0], "gi");
            let keys = Object.keys(copyRouteData).filter(key => /Module/gi.test(key) && regExp.test(key));

            if (keys.every(key => copyRouteData[key].load === true) || requestError === "Network error") {
                return this.setState({
                    status: status,
                    showLoader: false,
                });
            } else if (_.isNull(requestError) && status === "online") {
                return this.setState({
                    status: status,
                    showLoader: false,
                });
            }
        } else if (showLoader && status === "offline") {
            return this.setState({
                status: status,
                showLoader: false,
            });
        }

        if (
            !_.isNull(requestError) &&
            requestError[requestError.length - 1] === "Network error" &&
            status === "offline"
        ) {
            notification.error({ message: "Ошибка", description: "Интернет соединение недоступно." });
        }

        if (statusState !== status) {
            this.setState({
                status: status,
            });
        }
    };

    onCollapse = collapsed => {
        this.setState({ ...this.state, collapsed });
    };

    logout = event => {
        const { firebase, onLogoutAction } = this.props;
        if (firebase) firebase.signOut().then(() => onLogoutAction().then(() => this.props.history.push("/")));
    };

    updateLoader = event => {
        const {
            router,
            router: { currentActionTab },
        } = this.props;
        const { routeData = {} } = router;
        const copyRouteData = { ...routeData };
        let currentArray = currentActionTab.split("_" || "__");
        let regExp = new RegExp(currentArray[0], "gi");
        let keys = Object.keys(copyRouteData).filter(key => /Module/gi.test(key) && regExp.test(key));

        if (keys.length) {
            this.setState({
                showLoader: true,
            });
        }
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
            onLoadCurrentData,
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
                if (path.startsWith("taskModule") && path !== "taskModule_createTask") onLoadCurrentData(path);
            }
        } else if (mode === "close") {
            let size = tabData.parentSize / actionTabsCopy.length;
            if (size > 160) size = 160;

            let type = "deafult";
            if (path.split("__")[1]) type = "itemTab";
            if (isFind) removeTab({ path: path, type: type });
            if (size !== tabData.childrenSize) onSetChildrenSizeAction(size, true);
        }
    };

    render() {
        const { menuItems = null, showLoader } = this.state;
        const { router: { actionTabs = [], currentActionTab } = {}, firebase, onErrorRequstAction } = this.props;

        const actionTabsData = this.getActionTabs(actionTabs, menuItems);

        return (
            <React.Fragment>
                {showLoader ? <Loader className="mainLoader" /> : null}
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
                            dashboardStrem={this.dashboardStrem}
                            cbMenuTabHandler={this.menuHandler}
                            activeTabEUID={currentActionTab}
                            actionTabs={actionTabsData}
                            logout={this.logout}
                        />
                        <ContentView
                            dashboardStrem={this.dashboardStrem}
                            updateLoader={this.updateLoader}
                            onErrorRequstAction={onErrorRequstAction}
                            firebase={firebase}
                            key="contentView"
                            path={currentActionTab}
                        />
                    </Layout>
                </Layout>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        router: { ...state.router },
        tabData: state.tabReducer,
        publicReducer: state.publicReducer,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        moveTo: async path => await dispatch(updatePathAction(path)),
        addTab: tab => dispatch(addTabAction(tab)),
        removeTab: tab => dispatch(removeTabAction(tab)),
        setCurrentTab: tab => dispatch(setActiveTabAction(tab)),
        onSetChildrenSizeAction: (size, flag) => dispatch(setChildrenSizeAction(size, flag)),
        onLoadCurrentData: path => dispatch(loadCurrentData(path)),
        onErrorRequstAction: async error => await errorRequstAction(error),
        onLogoutAction: async () => await dispatch(logoutAction()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Dashboard);
