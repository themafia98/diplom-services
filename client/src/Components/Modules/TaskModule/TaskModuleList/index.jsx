import React from "react";
import TableView from "../../../TableView";
import TitleModule from "../../../TitleModule";

class TaskModuleList extends React.PureComponent {
    componentDidMount = () => {
        const { firebase } = this.props;
    };
    render() {
        const { data = null } = this.props;
        return (
            <div className="taskModule_all">
                <TitleModule additional="Все задачи" classNameTitle="taskModuleTittle" title="Список всех задач" />
                <div className="taskModuleAll_main">
                    <TableView tasks={data ? data.tasks : null} path="searchTable" />
                </div>
            </div>
        );
    }
}
export default TaskModuleList;
