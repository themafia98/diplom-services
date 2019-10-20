import React from "react";

import TaskModuleList from "./TaskModuleList";

class TaskModule extends React.Component {
    getTaskByPath = path => {
        if (path) {
            if (path === "taskModule_all") return <TaskModuleList />;
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
