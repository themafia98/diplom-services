import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import RenderInBrowser from "react-render-in-browser";
import { Switch, Route } from "react-router-dom";
import { message } from "antd";
import { PrivateRoute } from "./Components/Helpers";
import { forceUpdateDetectedInit } from "./Utils";

import { setStatus, loadUdata } from "./Redux/actions/publicActions";
import { addTabAction, setActiveTabAction, logoutAction } from "./Redux/actions/routerActions";

import { routeParser } from "./Utils";

import Loader from "./Components/Loader";
import Recovery from "./Components/Pages/Recovery";
import LoginPage from "./Components/Pages/LoginPage";
import Dashboard from "./Components/Pages/Dashboard";
import "moment/locale/ru";
import modelContext from "./Models/context";
// import { isMobile } from "react-device-detect";

class App extends React.Component {
    state = {
        loadState: false,
        isUser: false
    };

    static contextType = modelContext;

    static propTypes = {
        addTab: PropTypes.func.isRequired,
        onSetStatus: PropTypes.func.isRequired,
        router: PropTypes.object.isRequired,
        publicReducer: PropTypes.object.isRequired
    };

    loadAppSession = () => {
        const {
            addTab,
            setCurrentTab,
            router: { currentActionTab = "", actionTabs = [] } = {},
            onLoadUdata
        } = this.props;
        const { config = {}, Request } = this.context;
        const rest = new Request();

        return this.setState({ authLoad: true, loadState: true }, async () => {

            try {

                const res = await rest.sendRequest("/userload", "POST", null, true);

                if (res.status !== 200) {
                    throw new Error("Bad user data");
                }

                let path = "mainModule";
                const defaultModule = config.menu.find(item => item["SIGN"] === "default");
                if (defaultModule) path = defaultModule.EUID;

                const actionTabsCopy = [...actionTabs];
                const isFind = actionTabsCopy.findIndex(tab => tab === path) !== -1;

                const { data: { user = {} } = {} } = res || {};

                const udata = Object.keys(user).reduce((accumulator, key) => {

                    if (key !== "token") {
                        accumulator[key] = res.data["user"][key];
                    }

                    return accumulator || {};
                }, {});

                if (!isFind && config.tabsLimit <= actionTabsCopy.length)
                    return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
                const isUserData = udata && !_.isEmpty(udata);

                if (!isFind) {
                    if (isUserData) onLoadUdata(udata).then(() => addTab(routeParser({ path })));
                    else rest.signOut();
                } else if (currentActionTab !== path) {
                    if (isUserData) onLoadUdata(udata).then(() => setCurrentTab(path));
                    else rest.signOut();
                }

            } catch (error) {
                console.error(error);
                rest.signOut();
            }

        });
    };

    loadApp = () => {
        return this.setState({ loadState: true });
    };

    componentDidMount = () => {
        const { config = {}, Request } = this.context;
        const rest = new Request();
        rest.authCheck()
            .then(res => {
                if (res.status === 200) {
                    this.loadAppSession();
                } else {
                    throw new Error(res.message);
                }
            })
            .catch(err => {
                this.loadApp();
            });
        if (config.forceUpdate === true || config.forceUpdate === "true") forceUpdateDetectedInit();
    };

    render() {
        const { loadState, authLoad } = this.state;
        const { onLogoutAction } = this.props;
        if (loadState) {
            return (
                <React.Fragment>
                    <RenderInBrowser ie only>
                        <div className="ie-only">
                            <p>
                                Приложение не поддерживает браузер IE, предлагаем установить более современные браузеры.
                            </p>
                        </div>
                    </RenderInBrowser>
                    <RenderInBrowser except ie>
                        <Switch>
                            <Route exact path="/" render={props => <LoginPage {...props} authLoad={authLoad} />} />
                            <Route exact path="/recovory" render={props => <Recovery {...props} />} />
                            <PrivateRoute
                                exact
                                path="/dashboard"
                                onLogoutAction={onLogoutAction}
                                component={Dashboard}
                            />
                        </Switch>
                    </RenderInBrowser>
                </React.Fragment>
            );
        } else return <Loader />;
    }
}

const mapStateToProps = state => {
    const { udata = {} } = state.publicReducer || {};
    return {
        router: { ...state.router },
        publicReducer: { ...state.publicReducer },
        udata
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addTab: async tab => await dispatch(addTabAction(tab)),
        onSetStatus: status => dispatch(setStatus({ statusRequst: status })),
        setCurrentTab: tab => dispatch(setActiveTabAction(tab)),
        onLogoutAction: async () => await dispatch(logoutAction()),
        onLoadUdata: async udata => await dispatch(loadUdata(udata))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
