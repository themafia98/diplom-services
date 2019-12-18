import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import RenderInBrowser from "react-render-in-browser";
import { Switch, Route } from "react-router-dom";
import { message } from "antd";
import { PrivateRoute } from "./Components/Helpers";
import config from "./config.json";
import { forceUpdateDetectedInit } from "./Utils";

//import * as Sentry from "@sentry/browser";

import { setStatus, loadUdata } from "./Redux/actions/publicActions";
import { addTabAction } from "./Redux/actions/routerActions";

import { routeParser } from "./Utils";

import Loader from "./Components/Loader";
import Recovery from "./Components/Pages/Recovery";
import LoginPage from "./Components/Pages/LoginPage";
import Dashboard from "./Components/Pages/Dashboard";
import "moment/locale/ru";
// import { isMobile } from "react-device-detect";

class App extends React.Component {
    state = {
        loadState: false,
        isUser: false
    };

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
            rest,
            router: { currentActionTab = "", actionTabs = [] } = {},
            onLoadUdata
        } = this.props;
        return this.setState({ isUser: true, loadState: true }, () => {
            let path = "mainModule";
            const defaultModule = config.menu.find(item => item["SIGN"] === "default");
            if (defaultModule) path = defaultModule.EUID;

            const actionTabsCopy = [...actionTabs];
            const isFind = actionTabsCopy.findIndex(tab => tab === path) !== -1;

            if (!isFind && config.tabsLimit <= actionTabsCopy.length)
                return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

            const udata = null;

            if (!isFind && udata) {
                if (udata) onLoadUdata(udata).then(() => addTab(routeParser({ path })));
                else setCurrentTab(path);
            } else if (currentActionTab !== path) {
                if (udata) onLoadUdata(udata).then(() => setCurrentTab(path));
                else setCurrentTab(path);
            }
        });
    };

    loadApp = () => {
        return this.setState({ loadState: true });
    };

    componentDidMount = () => {
        this.loadApp();
        if (config.forceUpdate === true || process.env.NODE_ENV === "production") forceUpdateDetectedInit();
    };

    render() {
        const { loadState, isUser } = this.state;
        const { rest } = this.props;
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
                            <Route exact path="/" render={props => <LoginPage rest={rest} {...props} isUser={isUser} />} />
                            <Route exact path="/recovory" render={props => <Recovery {...props} />} />
                            <PrivateRoute exact path="/dashboard" rest={rest} component={Dashboard} />
                        </Switch>
                    </RenderInBrowser>
                </React.Fragment>
            );
        } else return <Loader />;
    }
}

const mapStateToProps = state => {
    return {
        router: { ...state.router },
        publicReducer: { ...state.publicReducer }
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addTab: async tab => await dispatch(addTabAction(tab)),
        onSetStatus: status => dispatch(setStatus({ statusRequst: status })),
        onLoadUdata: async udata => await dispatch(loadUdata(udata))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
