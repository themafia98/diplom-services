import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Layout } from "antd";

import Scrollbars from "react-custom-scrollbars";

import TabContainer from '../TabContainer';
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
        key: null
    };

    static propTypes = {
        dashboardStrem: PropTypes.object.isRequired,
        setCurrentTab: PropTypes.func.isRequired,
        updateLoader: PropTypes.func.isRequired,
        onErrorRequstAction: PropTypes.func.isRequired,
        firebase: PropTypes.object.isRequired,
        path: PropTypes.string.isRequired
    };

    componentDidMount = () => {
        const { dashboardStrem = null } = this.props;
        const { key = null } = this.state;
        document.addEventListener("keydown", this.disableF5);
        dashboardStrem.on("EventUpdate", this.updateFunction);
        if (_.isNull(key)) {
            this.setState({
                key: uuid()
            });
        }
    };

    componentDidUpdate = () => {
        const { shouldUpdate } = this.props;

        if (shouldUpdate) this.updateFunction();
    };

    componentWillUnmount = () => {
        const { dashboardStrem = null } = this.props;
        document.removeEventListener("keydown", this.disableF5);
        dashboardStrem.off("EventUpdate", this.updateFunction);
    };

    checkBackground = path => {
        const { actionTabs = [] } = this.props;
        return actionTabs.some(actionTab => actionTab.startsWith(path) || actionTab === path);
    }

    getComponentByPath = path => {
        if (!path) return null;

        const { firebase, onErrorRequstAction, setCurrentTab } = this.props;

        return (
            <React.Fragment>
                <TabContainer isBackground={this.checkBackground("mainModule")} visible={path === "mainModule"}>
                    <MainModule onErrorRequstAction={onErrorRequstAction} key="mainModule" firebase={firebase} />
                </TabContainer>
                <TabContainer isBackground={this.checkBackground('cabinetModule')} visible={path === 'cabinetModule'}>
                    <CabinetModule onErrorRequstAction={onErrorRequstAction} key="cabinet" firebase={firebase} />
                </TabContainer>
                <TabContainer isBackground={this.checkBackground("taskModule")} visible={path.startsWith('taskModule')}>
                    <TaskModule
                        onErrorRequstAction={onErrorRequstAction}
                        setCurrentTab={setCurrentTab}
                        key="taskModule"
                        path={path}
                        firebase={firebase}
                    />
                </TabContainer>
                <TabContainer isBackground={this.checkBackground("contactModule")} visible={path.startsWith("contactModule")}>
                    <ContactModule
                        onErrorRequstAction={onErrorRequstAction}
                        key="contact"
                        path={path}
                        firebase={firebase}
                    />
                </TabContainer>
                <TabContainer isBackground={this.checkBackground("customersModule")} visible={path.startsWith("customersModule")}>
                    <CustomersModule
                        onErrorRequstAction={onErrorRequstAction}
                        key="customers"
                        path={path}
                        firebase={firebase}
                    />
                </TabContainer>
                <TabContainer isBackground={this.checkBackground("settingsModule")} visible={path === "settingsModule"}>
                    <SettingsModule
                        onErrorRequstAction={onErrorRequstAction}
                        key="settings"
                        path={path}
                        firebase={firebase}
                    />
                </TabContainer>
                <TabContainer isBackground={this.checkBackground("statisticModule")} visible={path === "statisticModule"}>
                    <StatisticsModule
                        onErrorRequstAction={onErrorRequstAction}
                        key="statistic"
                        path={path}
                        firebase={firebase}
                    />
                </TabContainer>
            </React.Fragment>
        );
    };

    updateFunction = _.debounce(forceUpdate => {
        const { updateLoader, shouldUpdate } = this.props;
        this.setState({ ...this.state, key: uuid() }, () => {
            if (forceUpdate) {
                updateLoader();
            }
        });
    }, 300);

    disableF5 = event => {
        if ((event.which || event.keyCode) === 113) {
            return this.setState({ ...this.state, drawerView: !this.state.drawerView });
        }
        if ((event.which || event.keyCode) === 116) {
            event.preventDefault();
            this.updateFunction(true);
        }
    };

    onClose = event => {
        return this.setState({ ...this.state, drawerView: false });
    };

    render() {
        const { path } = this.props;
        const { drawerView, key } = this.state;
        return (
            <React.Fragment>
                <Content key={key}>{this.getComponentByPath(path)}</Content>
                <DrawerViewer onClose={this.onClose} visible={drawerView} />
            </React.Fragment>
        );
    }
}

export default ContentView;
