import React from "react";
import { connect } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
import { Button } from "antd";

import { addTabAction, loadCurrentData } from "../../../Redux/actions/routerActions";
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

    getTaskByPath = path => {
        if (path) {
            const isList = path === "taskModule_myTasks" || path === "taskModule_all";
            return (
                <Scrollbars>
                    {path === "taskModule_all" ? (
                        <TaskModuleList />
                    ) : path === "taskModule_myTasks" ? (
                        <TaskModuleMyList user="Павел Петрович" />
                    ) : path === "taskModule_сalendar" ? (
                        <TaskModuleCalendar />
                    ) : path === "taskModule_createTask" ? (
                        <CreateTask />
                    ) : path.startsWith("taskModule_") ? (
                        <TaskView key={path.split("__")[1]} uuid={path.split("__")[1]} />
                    ) : (
                        <div>Not found taskModule</div>
                    )}
                    {isList ? (
                        <Button onClick={this.handlerNewTask} type="primary">
                            Создать новую задачу
                        </Button>
                    ) : null}
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
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TaskModule);
