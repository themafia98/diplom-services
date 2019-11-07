import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
import { Button } from "antd";

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
        heightController: null,
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
            router: { currentActionTab },
        } = this.props;
        if (currentActionTab !== "taskModule_createTask") addTab("taskModule_createTask");
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
        const { onLoadCurrentData, path, router } = this.props;
        const { height, heightController } = this.state;

        if (!_.isNull(height) && !_.isNull(this.moduleTask)) {
            const heightControllerForState = this.controller ? this.controller.getBoundingClientRect().height : null;
            const heightForState = this.moduleTask.getBoundingClientRect().height;

            if (height !== heightForState || heightControllerForState !== heightController)
                this.setState({ ...this.state, height: heightForState, heightController: heightControllerForState });
        }

        if (
            path.startsWith("taskModule") &&
            !router.routeData["taskModule"] &&
            !router.routeData["taskModule_сalendar"]
        ) {
            onLoadCurrentData({ path: "taskModule", storeLoad: "tasks" });
        }
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
                setCurrentTab,
            } = this.props;
            return (
                <React.Fragment>
                    {isList ? (
                        <div key="controllers" ref={this.refControllers} className="controllersWrapper">
                            <Button onClick={this.handlerNewTask} type="primary">
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
                                firebase={firebase}
                                statusApp={status}
                            />
                        </Scrollbars>
                    ) : path.startsWith("taskModule_") ? (
                        <Scrollbars>
                            <TaskView
                                height={heightController ? height - heightController : height}
                                key={path.split("__")[1]}
                                data={router.routeData[path]}
                            />
                        </Scrollbars>
                    ) : (
                        <div>Not found taskModule</div>
                    )}
                </React.Fragment>
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
        router: state.router,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addTab: tab => dispatch(addTabAction(tab)),
        onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
        onLoadCurrentData: ({ path, storeLoad }) => dispatch(loadCurrentData({ path, storeLoad })),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TaskModule);
