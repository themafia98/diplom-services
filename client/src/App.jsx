import React from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { Request } from "./Utils";

import { PrivateRoute } from "./Components/Helpers";
import config from "./config.json";
import { forceUpdateDetectedInit } from "./Utils";

import { setStatus } from "./Redux/actions/publicActions";
import { updatePathAction, addTabAction } from "./Redux/actions/routerActions";

import Loader from "./Components/Loader";
import Recovery from "./Components/Pages/Recovery";
import LoginPage from "./Components/Pages/LoginPage";
import Dashboard from "./Components/Pages/Dashboard";
import "moment/locale/ru";
// import { isMobile } from "react-device-detect";

class App extends React.Component {
    state = {
        firebaseLoadState: false,
        isUser: false,
    };

    loadAppSession = () => {
        const { moveTo, addTab } = this.props;
        return this.setState({ isUser: true, firebaseLoadState: true }, () => {
            let path = "mainModule";
            const defaultModule = config.menu.find(item => item["SIGN"] === "default");
            if (defaultModule) path = defaultModule.EUID;
            moveTo("/dashboard").then(() => addTab(path));
        });
    };

    loadApp = () => {
        return this.setState({ firebaseLoadState: true });
    };

    componentDidMount() {
        /** load app */
        const {
            publicReducer: { status },
            onSetStatus,
            firebase,
        } = this.props;
        const { firebaseLoadState } = this.state;
        firebase.auth.onAuthStateChanged(user => {
            if (!firebaseLoadState) {
                setTimeout(
                    user ? this.loadAppSession.bind(this) : this.loadApp.bind(this),
                    Number(config.msTimeoutLoading),
                );
            }
        });

        if (config.forceUpdate === true || process.env.NODE_ENV === "production") forceUpdateDetectedInit();
        const request = new Request();
        request.test(statusRequst => (status !== statusRequst ? onSetStatus(statusRequst) : null));
    }

    render() {
        const { firebase } = this.props;
        const { firebaseLoadState, isUser } = this.state;
        if (firebaseLoadState) {
            return (
                <Switch>
                    <Route
                        exact
                        path="/"
                        render={props => <LoginPage {...props} isUser={isUser} firebase={firebase} />}
                    />
                    <Route exact path="/recovory" render={props => <Recovery {...props} firebase={firebase} />} />
                    <PrivateRoute exact path="/dashboard" component={Dashboard} firebase={firebase} />
                </Switch>
            );
        } else return <Loader />;
    }
}

const mapStateToProps = state => {
    return {
        router: { ...state.router },
        publicReducer: { ...state.publicReducer },
    };
};

const mapDispatchToProps = dispatch => {
    return {
        moveTo: async path => await dispatch(updatePathAction(path)),
        addTab: async tab => await dispatch(addTabAction(tab)),
        onSetStatus: status => dispatch(setStatus(status)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(App);
