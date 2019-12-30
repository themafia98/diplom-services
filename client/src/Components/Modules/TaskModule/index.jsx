import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import config from "../../../config.json";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
import { Button, message } from "antd";

import { routeParser } from "../../../Utils";

import TabContainer from "../../TabContainer";
import { addTabAction, openPageWithDataAction } from "../../../Redux/actions/routerActions";
import { loadCurrentData } from "../../../Redux/actions/routerActions/middleware";
import TaskModuleCalendar from "./TaskModuleCalendar";
import TaskModuleList from "./TaskModuleList";
import TaskModuleMyList from "./TaskModuleMyList";
import TaskView from "./TaskView";
import CreateTask from "./CreateTask";

class TaskModule extends React.PureComponent {
    state = {
        height: null,
        heightController: null
    };

    static propTypes = {
        onErrorRequstAction: PropTypes.func.isRequired,
        path: PropTypes.string.isRequired,
        addTab: PropTypes.func.isRequired,
        onOpenPageWithData: PropTypes.func.isRequired,
        onLoadCurrentData: PropTypes.func.isRequired,
        publicReducer: PropTypes.object.isRequired,
        router: PropTypes.object.isRequired
    };

    componentDidMount = () => {
        const { onLoadCurrentData, path, visible } = this.props;
        const { height } = this.state;

        if (_.isNull(height) && !_.isNull(this.moduleTask) && visible) {
            const heightControllerForState = this.controller ? this.controller.getBoundingClientRect().height : null;
            const heightForState = this.moduleTask.getBoundingClientRect().height;
            this.setState({ ...this.state, height: heightForState, heightController: heightControllerForState });
        }
        if (visible) onLoadCurrentData({ path, storeLoad: "tasks", useStore: true, methodRequst: "GET" });
    };

    componentDidUpdate = prevProps => {
        const {
            visible,
            onLoadCurrentData,
            path,
            router: { shouldUpdate = false }
        } = this.props;
        const { height, heightController } = this.state;

        if (!_.isNull(height) && !_.isNull(this.moduleTask) && visible) {
            const heightControllerForState = this.controller ? this.controller.getBoundingClientRect().height : null;
            const heightForState = this.moduleTask.getBoundingClientRect().height;

            if (height !== heightForState || heightControllerForState !== heightController)
                this.setState({ ...this.state, height: heightForState, heightController: heightControllerForState });
        }

        if (shouldUpdate && visible)
            onLoadCurrentData({ path, storeLoad: "tasks", useStore: true, methodRequst: "GET" });
    };

    moduleTask = null;
    controller = null;
    refModuleTask = node => (this.moduleTask = node);
    refControllers = node => (this.controller = node);

    handlerNewTask = event => {
        const {
            addTab,
            setCurrentTab,
            router: { currentActionTab, actionTabs }
        } = this.props;

        if (currentActionTab !== "taskModule_createTask") {
            if (config.tabsLimit <= actionTabs.length)
                return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
            const path = "taskModule_createTask";
            const isFind = actionTabs.findIndex(tab => tab === path) !== -1;

            if (!isFind) addTab(routeParser({ path }));
            else if (currentActionTab !== path) setCurrentTab(path);
        }
    };

    checkBackground = (path, mode = "default") => {
        const { actionTabs = [] } = this.props;
        if (mode === "default") return actionTabs.some(actionTab => actionTab === path);
    };

    getTaskByPath = path => {
        if (path) {
            const { height, heightController } = this.state;
            const isList = path === "taskModule_myTasks" || path === "taskModule_all";
            const {
                router,
                publicReducer: { status = null } = {},
                onOpenPageWithData,
                onLoadCurrentData,
                rest,
                setCurrentTab
            } = this.props;

            const isViewTask = path.startsWith("taskModule") && /__/gi.test(path);

            const isBackgroundTaskModuleAll = this.checkBackground("taskModule_all");
            const isBackgroundTaskModuleMyTasks = this.checkBackground("taskModule_myTasks");
            const isBackgroundTaskModuleCalendar = this.checkBackground("taskModule_сalendar");
            const isBackgroundTaskModuleCreateTask = this.checkBackground("taskModule_createTask");

            const route = routeParser({ pageType: "moduleItem", path });
            const isBackgroundTaskViewModule = _.isObject(route) && !_.isNull(route);

            const key = path.split("__")[1];

            return (
                <Scrollbars>
                    {isList ? (
                        <div key="controllers" ref={this.refControllers} className="controllersWrapper">
                            <Button className="newTaskButton" onClick={this.handlerNewTask} type="primary">
                                Создать новую задачу
                            </Button>
                        </div>
                    ) : null}
                    <TabContainer
                        className="tabList"
                        isBackground={isBackgroundTaskModuleAll}
                        visible={path === "taskModule_all"}
                    >
                        <TaskModuleList
                            key="taskList"
                            isBackground={isBackgroundTaskModuleAll}
                            rest={rest}
                            visible={path === "taskModule_all"}
                            setCurrentTab={setCurrentTab}
                            height={heightController ? height - heightController : height}
                            data={router.routeData[path]}
                        />
                    </TabContainer>
                    <TabContainer
                        className="tabList"
                        isBackground={isBackgroundTaskModuleMyTasks}
                        visible={path === "taskModule_myTasks"}
                    >
                        <TaskModuleMyList
                            key="myListTask"
                            rest={rest}
                            isBackground={isBackgroundTaskModuleMyTasks}
                            visible={path === "taskModule_myTasks"}
                            setCurrentTab={setCurrentTab}
                            height={height}
                            data={router.routeData[path]}
                            user="Павел Петрович"
                        />
                    </TabContainer>
                    <TabContainer
                        className="validateStyleWrapper"
                        isBackground={isBackgroundTaskModuleCalendar}
                        visible={path === "taskModule_сalendar"}
                    >
                        <TaskModuleCalendar
                            key="calendarTaskModule"
                            rest={rest}
                            isBackground={isBackgroundTaskModuleCalendar}
                            visible={path === "taskModule_сalendar"}
                            setCurrentTab={setCurrentTab}
                            onOpenPageWithData={onOpenPageWithData}
                            height={heightController ? height - heightController : height}
                            router={router}
                        />
                    </TabContainer>
                    <TabContainer
                        className="validateStyleWrapper"
                        isBackground={isBackgroundTaskModuleCreateTask}
                        visible={path === "taskModule_createTask"}
                    >
                        <CreateTask
                            key="createTask_module"
                            rest={rest}
                            isBackground={isBackgroundTaskModuleCreateTask}
                            visible={path === "taskModule_createTask"}
                            height={heightController ? height - heightController : height}
                            onLoadCurrentData={onLoadCurrentData}
                            statusApp={status}
                        />
                    </TabContainer>
                    <TabContainer
                        className="validateStyleWrapper"
                        isBackground={isBackgroundTaskViewModule}
                        visible={isViewTask}
                    >
                        <TaskView
                            key={key}
                            rest={rest}
                            isBackground={isBackgroundTaskViewModule}
                            visible={isViewTask}
                            height={heightController ? height - heightController : height}
                            onLoadCurrentData={onLoadCurrentData}
                            data={router.routeData[key]}
                        />
                    </TabContainer>
                </Scrollbars>
            );
        } else return <div>Not found path module</div>;
    };

    render() {
        const { path } = this.props;

        const component = this.getTaskByPath(path);
        return (
            <div key="taskModule" ref={this.refModuleTask} className="taskModule">
                {component ? component : null}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        publicReducer: state.publicReducer,
        router: state.router
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addTab: tab => dispatch(addTabAction(tab)),
        onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
        onLoadCurrentData: props => dispatch(loadCurrentData({ ...props }))
    };
};
export { TaskModule };
export default connect(mapStateToProps, mapDispatchToProps)(TaskModule);
