import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Layout } from "antd";

import TabContainer from "../TabContainer";
import DrawerViewer from "../DrawerViewer";

import MainModule from "../Modules/MainModule";
import CabinetModule from "../Modules/CabinetModule";
import TaskModule from "../Modules/TaskModule";
import StatisticsModule from "../Modules/StatisticsModule";
import SettingsModule from "../Modules/SettingsModule";
import ContactModule from "../Modules/ContactModule";
import CustomersModule from "../Modules/CustomersModule";
import DocumentModule from "../Modules/DocumentModule";

import uuid from "uuid/v4";

const { Content } = Layout;

class ContentView extends React.Component {
    state = {
        drawerView: false,
        key: null
    };

    static propTypes = {
        dashboardStrem: PropTypes.object.isRequired,
        setCurrentTab: PropTypes.func.isRequired,
        updateLoader: PropTypes.func.isRequired,
        onErrorRequstAction: PropTypes.func.isRequired,

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

    shouldComponentUpdate = (nextProps, nextState) => {
        if (
            nextProps.path !== this.props.path ||
            nextState.key !== this.state.key ||
            nextState.drawerView !== this.state.drawerView
        ) {
            return true;
        } else return false;
    };

    componentWillUnmount = () => {
        const { dashboardStrem = null } = this.props;
        document.removeEventListener("keydown", this.disableF5);
        dashboardStrem.off("EventUpdate", this.updateFunction);
    };

    checkBackground = path => {
        const { actionTabs = [] } = this.props;
        return actionTabs.some(actionTab => actionTab.startsWith(path) || actionTab === path);
    };

    updateFunction = _.debounce(forceUpdate => {
        const { updateLoader } = this.props;
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
        const { path, onErrorRequstAction, setCurrentTab, actionTabs, router, statusApp } = this.props;
        const { drawerView, key } = this.state;

        const isBackgroundMainModule = this.checkBackground("mainModule");
        const isBackgroundCabinetModule = this.checkBackground("cabinetModule");
        const isBackgroundTaskModule = this.checkBackground("taskModule");
        const isBackgroundContactModule = this.checkBackground("contactModule");
        const isBackgroundCustomersModule = this.checkBackground("customersModule");
        const isBackgroundSettingsModule = this.checkBackground("settingsModule");
        const isStatisticModule = this.checkBackground("statisticModule");
        const isDocumentModule = this.checkBackground("documentModule");

        return (
            <React.Fragment>
                <Content key={key}>
                    <TabContainer isBackground={isBackgroundMainModule} visible={path === "mainModule"}>
                        <MainModule
                            visible={path === "mainModule"}
                            isBackground={isBackgroundMainModule}
                            onErrorRequstAction={onErrorRequstAction}
                            key="mainModule"
                        />
                    </TabContainer>
                    <TabContainer
                        key="cabinet"
                        isBackground={isBackgroundCabinetModule}
                        visible={path === "cabinetModule"}
                    >
                        <CabinetModule
                            visible={path === "cabinetModule"}
                            isBackground={isBackgroundCabinetModule}
                            onErrorRequstAction={onErrorRequstAction}
                            key="cabinet"
                        />
                    </TabContainer>
                    <TabContainer
                        path={"taskModule"}
                        key="taskModule"
                        isBackground={isBackgroundTaskModule}
                        visible={path.startsWith("taskModule")}
                    >
                        <TaskModule
                            visible={path.startsWith("taskModule")}
                            isBackground={isBackgroundTaskModule}
                            onErrorRequstAction={onErrorRequstAction}
                            setCurrentTab={setCurrentTab}
                            key="taskModule"
                            path={path}
                        />
                    </TabContainer>
                    <TabContainer isBackground={isDocumentModule} visible={path === "documentModule"}>
                        <DocumentModule
                            visible={path === "documentModule"}
                            isBackground={isDocumentModule}
                            onErrorRequstAction={onErrorRequstAction}
                            key="documentModule"
                            path={path}
                            statusApp={statusApp}
                        />
                    </TabContainer>
                    <TabContainer isBackground={isBackgroundContactModule} visible={path.startsWith("contactModule")}>
                        <ContactModule
                            visible={path.startsWith("contactModule")}
                            actionTabs={actionTabs}
                            statusApp={statusApp}
                            router={router}
                            isBackground={isBackgroundContactModule}
                            onErrorRequstAction={onErrorRequstAction}
                            key="contact"
                            path={path}
                        />
                    </TabContainer>
                    <TabContainer
                        isBackground={isBackgroundCustomersModule}
                        visible={path.startsWith("customersModule")}
                    >
                        <CustomersModule
                            visible={path.startsWith("customersModule")}
                            isBackground={isBackgroundCustomersModule}
                            onErrorRequstAction={onErrorRequstAction}
                            actionTabs={actionTabs}
                            key="customers"
                            path={path}
                        />
                    </TabContainer>
                    <TabContainer isBackground={isBackgroundSettingsModule} visible={path === "settingsModule"}>
                        <SettingsModule
                            visible={path === "settingsModule"}
                            isBackground={isBackgroundSettingsModule}
                            onErrorRequstAction={onErrorRequstAction}
                            key="settings"
                            path={path}
                        />
                    </TabContainer>
                    <TabContainer isBackground={isStatisticModule} visible={path === "statisticModule"}>
                        <StatisticsModule
                            visible={path === "statisticModule"}
                            isBackground={isStatisticModule}
                            onErrorRequstAction={onErrorRequstAction}
                            key="statistic"
                            path={path}
                        />
                    </TabContainer>
                </Content>
                <DrawerViewer onClose={this.onClose} visible={drawerView} />
            </React.Fragment>
        );
    }
}

export default ContentView;
