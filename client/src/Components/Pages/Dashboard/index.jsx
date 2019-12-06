import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { EventEmitter } from "events";
import _ from "lodash";
import config from "../../../config.json";
import { Layout, message, notification, Modal, Button } from "antd";
import { connect } from "react-redux";
import {
    addTabAction,
    setActiveTabAction,
    removeTabAction,
    logoutAction,
    shouldUpdateAction
} from "../../../Redux/actions/routerActions";
import { loadCurrentData } from "../../../Redux/actions/routerActions/middleware";
import { errorRequstAction } from "../../../Redux/actions/publicActions";
import { routeParser } from "../../../Utils";

import Loader from "../../Loader";
import HeaderView from "../../HeaderView";
import ContentView from "../../ContentView";
import MenuView from "../../MenuView";

class Dashboard extends React.PureComponent {
    dashboardStrem = new EventEmitter();
    deferredPrompt = null;
    state = {
        collapsed: true,
        guideVisible: true,
        visibleInstallApp: false,
        redirect: false,
        status: "online",
        menuItems: config.menu,
        counterError: 0,
        showLoader: false
    };

    static propTypes = {
        addTab: PropTypes.func.isRequired,
        removeTab: PropTypes.func.isRequired,
        setCurrentTab: PropTypes.func.isRequired,
        onLoadCurrentData: PropTypes.func.isRequired,
        onErrorRequstAction: PropTypes.func.isRequired,
        onLogoutAction: PropTypes.func.isRequired,
        router: PropTypes.object.isRequired,
        publicReducer: PropTypes.object.isRequired
    };

    componentDidMount = () => {
        // window.addEventListener("beforeinstallprompt", e => {
        //     debugger;
        //     // Prevent Chrome 67 and earlier from automatically showing the prompt
        //     e.preventDefault();
        //     // Stash the event so it can be triggered later.
        //     this.deferredPrompt = e;
        //     console.log("install");
        //     this.setState({
        //         visibleInstallApp: true
        //     });
        // });

        window.addEventListener("appinstalled", evt => {
            console.log("appinstalled fired", evt);
        });
    };

    componentDidUpdate = () => {
        const {
            publicReducer: { requestError = null, status } = {},
            router,
            firebase,
            router: { currentActionTab = "" }
        } = this.props;
        const { showLoader, status: statusState, counterError, redirect = false } = this.state;

        if (redirect) return;
        if (!firebase.getCurrentUser()) {
            return this.setState({
                redirect: true
            });
        }

        if (!showLoader && statusState !== status && status === "online")
            notification.success({ message: "Удачно", description: "Интернет соединение восстановлено." });

        if (showLoader && _.isNull(requestError) && status === "online") {
            const { routeData = {} } = router;
            const copyRouteData = { ...routeData };
            let currentArray = currentActionTab.split("_" || "__");
            let regExp = new RegExp(currentArray[0], "gi");
            let keys = Object.keys(copyRouteData).filter(key => /Module/gi.test(key) && regExp.test(key));

            if (keys.every(key => copyRouteData[key].load === true) || requestError === "Network error") {
                return setTimeout(() => {
                    this.setState({
                        status: status,
                        showLoader: false
                    });
                }, 500);
            } else if (_.isNull(requestError) && status === "online") {
                return setTimeout(() => {
                    this.setState({
                        counter: 0,
                        status: status,
                        showLoader: false
                    });
                }, 500);
            }
        } else if (showLoader && status === "offline") {
            return setTimeout(() => {
                this.setState({
                    status: status,
                    showLoader: false
                });
            }, 500);
        }

        if (
            !_.isNull(requestError) &&
            requestError[requestError.length - 1] === "Network error" &&
            status === "offline" &&
            counterError === 0
        ) {
            this.setState({ counterError: counterError + 1 }, () =>
                notification.error({ message: "Ошибка", description: "Интернет соединение недоступно." })
            );
        }

        if (statusState !== status) {
            return this.setState({
                status: status
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

    closeGuild = event => {
        this.setState({
            guideVisible: false
        });
    };

    updateLoader = event => {
        const {
            router,
            router: { currentActionTab, shouldUpdate }
        } = this.props;
        const { routeData = {} } = router;
        const copyRouteData = { ...routeData };
        let currentArray = currentActionTab.split("_" || "__");
        let regExp = new RegExp(currentArray[0], "gi");
        let keys = Object.keys(copyRouteData).filter(key => /Module/gi.test(key) && regExp.test(key));

        if (keys.length && !shouldUpdate) this.setState({ showLoader: true });
    };

    getActionTabs = (tabs = [], menu) => {
        const { router: { routeData = {} } = {} } = this.props;
        const tabsCopy = [...tabs];
        const tabsArray = [];
        for (let i = 0; i < tabsCopy.length; i++) {
            let tabItem = menu.find(tab => tab.EUID === tabsCopy[i]);
            if (!tabItem) {
                const PAGEDATA = routeParser({ pageType: "page", path: tabsCopy[i] });
                const PARENT_CODE = PAGEDATA["page"];
                const DATAKEY = PAGEDATA["pageChild"] || PAGEDATA["page"] || "";
                const { listdata: { title: titleListdata = "" } = {}, title = "", name = "" } =
                    routeData[DATAKEY] || {};

                const VALUE = DATAKEY && name ? name : title ? title : titleListdata ? titleListdata : DATAKEY;
                tabItem = { EUID: PAGEDATA["path"] || tabsCopy[i], PARENT_CODE, DATAKEY, VALUE };
            }
            if (tabItem) tabsArray.push({ ...tabItem });
        }
        return tabsArray;
    };

    goHome = event => {
        const { addTab, setCurrentTab, router: { currentActionTab = "", actionTabs = [] } = {} } = this.props;
        if (currentActionTab === "mainModule") return;

        if (config.tabsLimit <= actionTabs.length)
            return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

        let tabItem = actionTabs.find(tab => tab === "mainModule");
        if (!tabItem) addTab("mainModule");
        else setCurrentTab("mainModule");
    };

    goCabinet = event => {
        const { addTab, setCurrentTab, router: { currentActionTab = "", actionTabs = [] } = {} } = this.props;

        if (currentActionTab === "cabinetModule") return;

        if (config.tabsLimit <= actionTabs.length)
            return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

        let tabItem = actionTabs.find(tab => tab === "cabinetModule");
        if (!tabItem) addTab("cabinetModule");
        else setCurrentTab("cabinetModule");
    };

    menuHandler = (event, key, mode = "open") => {
        const path = event["key"] ? event["key"] : key;
        const { router: { currentActionTab, actionTabs = [] } = {}, addTab, setCurrentTab, removeTab } = this.props;

        const actionTabsCopy = [...actionTabs];
        const isFind = actionTabsCopy.findIndex(tab => tab === path) !== -1;

        if (mode === "open") {
            if (!isFind && config.tabsLimit <= actionTabsCopy.length)
                return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

            if (!isFind) addTab(routeParser({ path }));
            else if (currentActionTab !== path) {
                setCurrentTab(path);
            }
        } else if (mode === "close") {
            let type = "deafult";
            if (path.split("__")[1]) type = "itemTab";
            if (isFind) removeTab({ path: path, type: type });
        }
    };

    installApp = event => {
        if (!this.deferredPrompt) {
            return notification.error({
                message: "Ошибка",
                description: "Невозможно скачать приложение, возможно ваш браузер устарел."
            });
        }
        this.deferredPrompt.prompt();

        this.deferredPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === "accepted") {
                console.log("PWA setup accepted");
                // hide our user interface that shows our A2HS button
            } else {
                console.log("PWA setup rejected");
            }
            this.deferredPrompt = null;
        });
    };

    render() {
        const { menuItems = null, showLoader, redirect, guideVisible, visibleInstallApp = false } = this.state;
        const {
            router: { actionTabs = [], currentActionTab, shouldUpdate = false } = {},
            router = {},
            firebase,
            onErrorRequstAction,
            onShoudUpdate,
            firstConnect = false,
            setCurrentTab
        } = this.props;

        if (redirect) return <Redirect to={{ pathname: "/" }} />;

        const actionTabsData = this.getActionTabs(actionTabs, menuItems);

        return (
            <React.Fragment>
                {showLoader ? <Loader className="mainLoader" /> : null}
                <Layout className="layout_menu">
                    <MenuView
                        key="menu"
                        items={menuItems}
                        activeTabEUID={currentActionTab}
                        cbMenuHandler={this.menuHandler}
                        collapsed={this.state.collapsed}
                        cbOnCollapse={this.onCollapse}
                        cbGoMain={this.goHome}
                    />
                    <Layout key="main">
                        <HeaderView
                            key="header"
                            dashboardStrem={this.dashboardStrem}
                            cbMenuTabHandler={this.menuHandler}
                            activeTabEUID={currentActionTab}
                            actionTabs={actionTabsData ? actionTabsData : false}
                            logout={this.logout}
                            goCabinet={this.goCabinet}
                        />
                        <ContentView
                            dashboardStrem={this.dashboardStrem}
                            actionTabs={actionTabs}
                            shouldUpdate={shouldUpdate}
                            router={router}
                            onShoudUpdate={onShoudUpdate}
                            setCurrentTab={setCurrentTab}
                            updateLoader={this.updateLoader}
                            onErrorRequstAction={onErrorRequstAction}
                            firebase={firebase}
                            key="contentView"
                            path={currentActionTab}
                        />
                        <Modal
                            className="guideModal"
                            okText="Закрыть"
                            title="Добро пожаловать в систему."
                            visible={guideVisible && firstConnect}
                            onOk={this.closeGuild}
                        >
                            <p>Спасибо что выбрали {config.title ? `${config.title}` : "нашу систему!"}</p>
                            {visibleInstallApp ? (
                                <React.Fragment>
                                    <p>Вы можете установить приложение на ваш компьютер</p>

                                    <Button onClick={this.installApp} className="setupButton">
                                        Установить приложение
                                    </Button>
                                </React.Fragment>
                            ) : null}
                        </Modal>
                    </Layout>
                </Layout>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    const { firstConnect = false } = state.publicReducer;
    return {
        router: { ...state.router },
        publicReducer: state.publicReducer,
        firstConnect
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addTab: tab => dispatch(addTabAction(tab)),
        removeTab: tab => dispatch(removeTabAction(tab)),
        setCurrentTab: tab => dispatch(setActiveTabAction(tab)),
        onLoadCurrentData: ({ path, storeLoad }) => dispatch(loadCurrentData({ path, storeLoad })),
        onErrorRequstAction: async error => await errorRequstAction(error),
        onShoudUpdate: async update => await shouldUpdateAction(update),
        onLogoutAction: async () => await dispatch(logoutAction())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
export { Dashboard };
