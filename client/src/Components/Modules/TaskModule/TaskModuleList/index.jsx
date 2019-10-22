import React from "react";
import Scrollbars from "react-custom-scrollbars";
import TableView from "../../../TableView";
import TitleModule from "../../../TitleModule";

import TaskView from "../TaskView";

class TaskModuleList extends React.PureComponent {
    render() {
        return (
            <Scrollbars>
                <div className="taskModule_all">
                    <TitleModule additional="Все задачи" classNameTitle="taskModuleTittle" title="Список всех задач" />
                    <div className="taskModuleAll_main">
                        <TableView path="searchTable" />
                        <TaskView />
                    </div>
                </div>
            </Scrollbars>
        );
    }
}
export default TaskModuleList;
