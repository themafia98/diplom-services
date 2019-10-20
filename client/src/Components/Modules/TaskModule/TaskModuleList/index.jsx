import React from "react";

import TableView from "../../../TableView";
import TitleModule from "../../../TitleModule";

class TaskModuleList extends React.Component {
    render() {
        return (
            <div className="taskModule_all">
                <TitleModule additional="Все задачи" classNameTitle="taskModuleTittle" title="Список всех задач" />
                <div className="taskModuleAll_main">
                    <div className="tableViw__wrapper">
                        <TableView path={"taskModule__all"} />
                    </div>
                </div>
            </div>
        );
    }
}
export default TaskModuleList;
