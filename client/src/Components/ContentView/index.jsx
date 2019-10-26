import React from "react";
import $ from "jquery";
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
        key: null,
    };

    componentDidMount = () => {
        if (!this.state.key) this.setState({ ...this.state, key: uuid() });
    };

    componentDidUpdate = () => {
        console.log("componentDidUpdate ContentView");
    };

    getComponentByPath = path => {
        if (!path) return null;

        const { firebase } = this.props;

        return (
            <React.Fragment>
                {path === "mainModule" ? (
                    <MainModule key="mainModule" firebase={firebase} />
                ) : path === "cabinetModule" ? (
                    <CabinetModule key="cabinet" firebase={firebase} />
                ) : path.startsWith("taskModule") ? (
                    <TaskModule key="taskModule" path={path} firebase={firebase} />
                ) : path.startsWith("contactModule") ? (
                    <ContactModule key="contact" path={path} firebase={firebase} />
                ) : path.startsWith("customersModule") ? (
                    <CustomersModule key="customers" path={path} firebase={firebase} />
                ) : path === "settingsModule" ? (
                    <SettingsModule key="settings" path={path} firebase={firebase} />
                ) : path === "statisticModule" ? (
                    <StatisticsModule key="statistic" firebase={firebase} />
                ) : (
                    <div>Not found module: ${path}</div>
                )}
            </React.Fragment>
        );
    };

    disableF5 = event => {
        if ((event.which || event.keyCode) === 113) {
            return this.setState({ ...this.state, drawerView: !this.state.drawerView });
        }
        if ((event.which || event.keyCode) === 116) {
            event.preventDefault();
            return this.setState({ ...this.state, key: uuid() });
        }
    };

    onClose = event => {
        return this.setState({ ...this.state, drawerView: false });
    };

    componentDidMount = () => {
        $(document).on("keydown", this.disableF5);
    };

    componentWillUnmount = () => {
        $(document).off("keydown");
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
