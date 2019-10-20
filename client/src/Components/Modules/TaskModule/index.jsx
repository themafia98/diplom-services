import React from "react";

import TaskModuleList from "./TaskModuleList";
import TaskModuleMyList from "./TaskModuleMyList";

class TaskModule extends React.PureComponent {
    getTaskByPath = path => {
        if (path) {
            if (path === "taskModule_all") return <TaskModuleList />;
            if (path === "taskModule_myTasks") return <TaskModuleMyList user="Павел Петрович" />;
            else return <div>Not found taskModule</div>;
        }
    };
    render() {
        const { path } = this.props;
        const component = this.getTaskByPath(path);
        return <div className="taskModule">{component ? component : null}</div>;
    }
}

export default TaskModule;
