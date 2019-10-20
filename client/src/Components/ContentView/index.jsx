import React from "react";
import $ from "jquery";
import { Layout } from "antd";

import MainModule from "../Modules/MainModule";
import CabinetModule from "../Modules/CabinetModule";
import TaskModule from "../Modules/TaskModule";

import uuid from "uuid/v4";

const { Content } = Layout;

class ContentView extends React.PureComponent {
    state = {
        key: uuid(),
    };

    getComponentByPath = path => {
        const { firebase } = this.props;

        if (path) {
            if (path === "mainModule") return <MainModule firebase={firebase} />;
            if (path === "cabinetModule") return <CabinetModule firebase={firebase} />;
            if (path.startsWith("taskModule")) return <TaskModule path={path} firebase={firebase} />;
            else return <div>Not found module: ${path}</div>;
        } else return null;
    };

    disableF5 = event => {
        if ((event.which || event.keyCode) === 116) {
            event.preventDefault();
            return this.setState({ ...this.state, key: uuid() });
        }
    };

    componentDidMount = () => {
        $(document).on("keydown", this.disableF5);
    };

    componentWillUnmount = () => {
        $(document).off("keydown");
    };

    render() {
        const { path } = this.props;
        const { key } = this.state;
        return <Content key={key}>{this.getComponentByPath(path)}</Content>;
    }
}

export default ContentView;
