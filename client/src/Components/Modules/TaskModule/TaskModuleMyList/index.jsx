import React from "react";
import TableView from "../../../TableView";
import TitleModule from "../../../TitleModule";

class TaskModuleMyList extends React.Component {
    render() {
        const { user, data = null, height } = this.props;

        return (
            <div ref={this.refModuleTask} className="taskModule_all">
                <TitleModule additional="Мои задачи" classNameTitle="taskModuleTittle" title="Список моих задач" />
                <div className="taskModuleAll_main">
                    <TableView
                        height={height}
                        tasks={data ? data.tasks : null}
                        data={data}
                        flag={true}
                        user={user}
                        path="searchTable"
                    />
                </div>
            </div>
        );
    }
}
export default TaskModuleMyList;
