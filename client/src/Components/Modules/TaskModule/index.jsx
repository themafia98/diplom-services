import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import config from "../../../config.json";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
import { Button, message } from "antd";

import { routeParser } from "../../../Utils";

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
        firebase: PropTypes.object.isRequired,
        addTab: PropTypes.func.isRequired,
        onOpenPageWithData: PropTypes.func.isRequired,
        onLoadCurrentData: PropTypes.func.isRequired,
        publicReducer: PropTypes.object.isRequired,
        router: PropTypes.object.isRequired
    };

    moduleTask = null;
    controller = null;
    refModuleTask = node => (this.moduleTask = node);
    refControllers = node => (this.controller = node);

    componentDidMount = () => {
        const { height } = this.state;
        if (_.isNull(height) && !_.isNull(this.moduleTask)) {
            const heightControllerForState = this.controller ? this.controller.getBoundingClientRect().height : null;
            const heightForState = this.moduleTask.getBoundingClientRect().height;
            this.setState({ ...this.state, height: heightForState, heightController: heightControllerForState });
        }
    };

    handlerNewTask = event => {
        const {
            addTab,
            router: { currentActionTab, actionTabs }
        } = this.props;

        if (currentActionTab !== "taskModule_createTask") {
            if (config.tabsLimit <= actionTabs.length)
                return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

            addTab(routeParser({ path: "taskModule_createTask" }));
        }
    };

    componentDidMount = () => {
        const { onLoadCurrentData, path } = this.props;
        const { height } = this.state;

        if (_.isNull(height) && !_.isNull(this.moduleTask)) {
            const heightControllerForState = this.controller ? this.controller.getBoundingClientRect().height : null;
            const heightForState = this.moduleTask.getBoundingClientRect().height;
            this.setState({ ...this.state, height: heightForState, heightController: heightControllerForState });
        }
        onLoadCurrentData({ path, storeLoad: "tasks" });
    };

    componentDidUpdate = () => {
        const {
            onLoadCurrentData,
            path,
            router: { shouldUpdate = false, routeData = {} } = {},
            router = {}
        } = this.props;
        const { height, heightController } = this.state;

        if (!_.isNull(height) && !_.isNull(this.moduleTask)) {
            const heightControllerForState = this.controller ? this.controller.getBoundingClientRect().height : null;
            const heightForState = this.moduleTask.getBoundingClientRect().height;

            if (height !== heightForState || heightControllerForState !== heightController)
                this.setState({ ...this.state, height: heightForState, heightController: heightControllerForState });
        }

        // const { load = false } = routeData[path.split("_")[0] || path] || {};

        // if (
        //     (path.startsWith("taskModule") &&
        //         !router.routeData["taskModule"] &&
        //         !router.routeData["taskModule_сalendar"]) ||
        //     (shouldUpdate && load)
        // ) {
        //     onLoadCurrentData({ path: "taskModule", storeLoad: "tasks", shouldUpdate });
        // }
    };

    getTaskByPath = path => {
        if (path) {
            const { height, heightController } = this.state;
            const isList = path === "taskModule_myTasks" || path === "taskModule_all";
            const {
                router,
                firebase,
                publicReducer: { status = null } = {},
                onOpenPageWithData,
                onLoadCurrentData,
                setCurrentTab
            } = this.props;
            //
            return (
                <Scrollbars>
                    {isList ? (
                        <div key="controllers" ref={this.refControllers} className="controllersWrapper">
                            <Button className="newTaskButton" onClick={this.handlerNewTask} type="primary">
                                Создать новую задачу
                            </Button>
                        </div>
                    ) : null}
                    {path === "taskModule_all" ? (
                        <TaskModuleList
                            setCurrentTab={setCurrentTab}
                            height={heightController ? height - heightController : height}
                            data={router.routeData[path]}
                        />
                    ) : path === "taskModule_myTasks" ? (
                        <TaskModuleMyList
                            setCurrentTab={setCurrentTab}
                            height={height}
                            data={router.routeData[path]}
                            user="Павел Петрович"
                        />
                    ) : path === "taskModule_сalendar" ? (
                        <Scrollbars>
                            <TaskModuleCalendar
                                setCurrentTab={setCurrentTab}
                                onOpenPageWithData={onOpenPageWithData}
                                height={heightController ? height - heightController : height}
                                router={router}
                            />
                        </Scrollbars>
                    ) : path === "taskModule_createTask" ? (
                        <Scrollbars>
                            <CreateTask
                                height={heightController ? height - heightController : height}
                                onLoadCurrentData={onLoadCurrentData}
                                firebase={firebase}
                                statusApp={status}
                            />
                        </Scrollbars>
                    ) : path.startsWith("taskModule") ? (
                        <Scrollbars>
                            <TaskView
                                height={heightController ? height - heightController : height}
                                key={path.split("__")[1]}
                                onLoadCurrentData={onLoadCurrentData}
                                data={router.routeData[path.split("__")[1]]}
                            />
                        </Scrollbars>
                    ) : (
                                            <div>Not found taskModule</div>
                                        )}
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
        onLoadCurrentData: ({ path, storeLoad, shouldUpdate }) =>
            dispatch(loadCurrentData({ path, storeLoad, shouldUpdate }))
    };
};
export { TaskModule };
export default connect(mapStateToProps, mapDispatchToProps)(TaskModule);
