import React from "react";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
import { Button } from "antd";

import { addTabAction } from "../../../Redux/actions/routerActions";
import { loadCurrentData } from "../../../Redux/actions/routerActions/middleware";
import TaskModuleCalendar from "./TaskModuleCalendar";
import TaskModuleList from "./TaskModuleList";
import TaskModuleMyList from "./TaskModuleMyList";
import TaskView from "./TaskView";
import CreateTask from "./CreateTask";

class TaskModule extends React.PureComponent {
    handlerNewTask = event => {
        const {
            addTab,
            router: { currentActionTab },
        } = this.props;
        if (currentActionTab !== "taskModule_createTask") addTab("taskModule_createTask");
    };

    componentDidMount = () => {
        const { onLoadCurrentData, path } = this.props;
        onLoadCurrentData(path);
    };

    componentDidUpdate = () => {
        const { onLoadCurrentData, path, router } = this.props;
        if (path.startsWith("taskModule") && !router.routeData["taskModule"]) {
            onLoadCurrentData(path);
        }
    };

    getTaskByPath = path => {
        if (path) {
            const isList = path === "taskModule_myTasks" || path === "taskModule_all";
            const { router, firebase } = this.props;
            return (
                <Scrollbars>
                    {isList ? (
                        <div className="controllersWrapper">
                            <Button onClick={this.handlerNewTask} type="primary">
                                Создать новую задачу
                            </Button>
                        </div>
                    ) : null}
                    {path === "taskModule_all" ? (
                        <TaskModuleList data={router.routeData[path]} />
                    ) : path === "taskModule_myTasks" ? (
                        <TaskModuleMyList data={router.routeData[path]} user="Павел Петрович" />
                    ) : path === "taskModule_сalendar" ? (
                        <TaskModuleCalendar />
                    ) : path === "taskModule_createTask" ? (
                        <CreateTask firebase={firebase} />
                    ) : path.startsWith("taskModule_") ? (
                        <TaskView key={path.split("__")[1]} data={router.routeData[path]} />
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
        return <div className="taskModule">{component ? component : null}</div>;
    }
}

const mapStateToProps = state => {
    return {
        router: state.router,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addTab: tab => dispatch(addTabAction(tab)),
        onLoadCurrentData: path => dispatch(loadCurrentData(path)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TaskModule);
