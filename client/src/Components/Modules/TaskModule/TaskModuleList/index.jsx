import React from "react";
import TableView from "../../../TableView";
import TitleModule from "../../../TitleModule";

class TaskModuleList extends React.PureComponent {
    render() {
        const { data = null, height } = this.props;
        console.log(height);
        return (
            <div className="taskModule_all">
                <TitleModule additional="Все задачи" classNameTitle="taskModuleTittle" title="Список всех задач" />
                <div className="taskModuleAll_main">
                    <TableView height={height} tasks={data ? data.tasks : null} path="searchTable" />
                </div>
            </div>
        );
    }
}
export default TaskModuleList;
