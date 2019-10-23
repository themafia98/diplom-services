import React from "react";

import TaskModuleCalendar from "./TaskModuleCalendar";
import TaskModuleList from "./TaskModuleList";
import TaskModuleMyList from "./TaskModuleMyList";
import TaskView from "../TaskModule/TaskView";

class TaskModule extends React.PureComponent {
    getTaskByPath = path => {
        if (path) {
            if (path === "taskModule_all") return <TaskModuleList />;
            else if (path === "taskModule_myTasks") return <TaskModuleMyList user="Павел Петрович" />;
            else if (path === "taskModule_сalendar") return <TaskModuleCalendar />;
            else if (path.startsWith("taskModule_"))
                return <TaskView key={path.split("__")[1]} uuid={path.split("__")[1]} />;
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
