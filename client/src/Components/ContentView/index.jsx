import React from "react";
import _ from "lodash";
import { Layout } from "antd";

import DrawerViewer from "../DrawerViewer";
import MainModule from "../Modules/MainModule";
import CabinetModule from "../Modules/CabinetModule";
import TaskModule from "../Modules/TaskModule";
import StatisticsModule from "../Modules/StatisticsModule";
import SettingsModule from "../Modules/SettingsModule";
import ContactModule from "../Modules/ContactModule";
import CustomersModule from "../Modules/CustomersModule";

import uuid from "uuid/v4";

const { Content } = Layout;

class ContentView extends React.PureComponent {
    state = {
        drawerView: false,
        key: uuid(),
    };

    componentDidMount = () => {
        const { dashboardStrem = null } = this.props;
        document.addEventListener("keydown", this.disableF5);
        dashboardStrem.on("EventUpdate", this.updateFunction);
    };

    componentWillUnmount = () => {
        const { dashboardStrem = null } = this.props;
        document.removeEventListener("keydown", this.disableF5);
        dashboardStrem.off("EventUpdate", this.updateFunction);
    };

    getComponentByPath = path => {
        if (!path) return null;

        const { firebase, onErrorRequstAction } = this.props;

        return (
            <React.Fragment>
                {path === "mainModule" ? (
                    <MainModule onErrorRequstAction={onErrorRequstAction} key="mainModule" firebase={firebase} />
                ) : path === "cabinetModule" ? (
                    <CabinetModule onErrorRequstAction={onErrorRequstAction} key="cabinet" firebase={firebase} />
                ) : path.startsWith("taskModule") ? (
                    <TaskModule
                        onErrorRequstAction={onErrorRequstAction}
                        key="taskModule"
                        path={path}
                        firebase={firebase}
                    />
                ) : path.startsWith("contactModule") ? (
                    <ContactModule
                        onErrorRequstAction={onErrorRequstAction}
                        key="contact"
                        path={path}
                        firebase={firebase}
                    />
                ) : path.startsWith("customersModule") ? (
                    <CustomersModule
                        onErrorRequstAction={onErrorRequstAction}
                        key="customers"
                        path={path}
                        firebase={firebase}
                    />
                ) : path === "settingsModule" ? (
                    <SettingsModule
                        onErrorRequstAction={onErrorRequstAction}
                        key="settings"
                        path={path}
                        firebase={firebase}
                    />
                ) : path === "statisticModule" ? (
                    <StatisticsModule onErrorRequstAction={onErrorRequstAction} key="statistic" firebase={firebase} />
                ) : (
                                                <div>Not found module: ${path}</div>
                                            )}
            </React.Fragment>
        );
    };

    updateFunction = _.debounce(() => {
        const { updateLoader } = this.props;
        this.setState({ ...this.state, key: uuid() }, () => updateLoader());
    }, 500);

    disableF5 = event => {
        if ((event.which || event.keyCode) === 113) {
            return this.setState({ ...this.state, drawerView: !this.state.drawerView });
        }
        if ((event.which || event.keyCode) === 116) {
            event.preventDefault();
            this.updateFunction();
        }
    };

    onClose = event => {
        return this.setState({ ...this.state, drawerView: false });
    };

    render() {
        const { path } = this.props;
        const { drawerView } = this.state;
        return (
            <React.Fragment>
                <Content key={this.state.key}>{this.getComponentByPath(path)}</Content>
                <DrawerViewer onClose={this.onClose} visible={drawerView} />
            </React.Fragment>
        );
    }
}

export default ContentView;
