import React from "react";
import Scrollbars from "react-custom-scrollbars";
import { Button } from "antd";
import TaskModuleCalendar from "./TaskModuleCalendar";
import TaskModuleList from "./TaskModuleList";
import TaskModuleMyList from "./TaskModuleMyList";
import TaskView from "../TaskModule/TaskView";

class TaskModule extends React.PureComponent {
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
                    ) : path.startsWith("taskModule_") ? (
                        <TaskView key={path.split("__")[1]} uuid={path.split("__")[1]} />
                    ) : (
                        <div>Not found taskModule</div>
                    )}
                    {isList ? <Button type="primary">Создать новую задачу</Button> : null}
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

export default TaskModule;
