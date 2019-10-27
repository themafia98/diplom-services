import React from "react";

import TableView from "../../../TableView";
import TitleModule from "../../../TitleModule";

class TaskModuleMyList extends React.PureComponent {
    render() {
        const { user, data = null } = this.props;
        return (
            <div className="taskModule_all">
                <TitleModule additional="Мои задачи" classNameTitle="taskModuleTittle" title="Список моих задач" />
                <div className="taskModuleAll_main">
                    <TableView
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
