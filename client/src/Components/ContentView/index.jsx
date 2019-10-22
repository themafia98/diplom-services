import React from "react";
import $ from "jquery";
import { Layout } from "antd";

import DrawerViewer from "../DrawerViewer";

import MainModule from "../Modules/MainModule";
import CabinetModule from "../Modules/CabinetModule";
import TaskModule from "../Modules/TaskModule";
import SettingsModule from "../Modules/settingsModule";

import uuid from "uuid/v4";

const { Content } = Layout;

class ContentView extends React.PureComponent {
    state = {
        drawerView: false,
        key: uuid(),
    };

    getComponentByPath = path => {
        if (!path) return null;

        const { firebase } = this.props;

        if (path === "mainModule") return <MainModule firebase={firebase} />;
        if (path === "cabinetModule") return <CabinetModule firebase={firebase} />;
        if (path.startsWith("taskModule")) return <TaskModule path={path} firebase={firebase} />;
        if (path === "settingsModule") return <SettingsModule firebase={firebase} />;
        else return <div>Not found module: ${path}</div>;
    };

    disableF5 = event => {
        if ((event.which || event.keyCode) === 113) {
            debugger;
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
        const { key, drawerView } = this.state;
        return (
            <React.Fragment>
                <Content key={key}>{this.getComponentByPath(path)}</Content>
                <DrawerViewer onClose={this.onClose} visible={drawerView} />
            </React.Fragment>
        );
    }
}

export default ContentView;
