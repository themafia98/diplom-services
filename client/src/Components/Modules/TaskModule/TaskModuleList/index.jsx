import React from "react";
import PropTypes from "prop-types";
import TableView from "../../../TableView";
import TitleModule from "../../../TitleModule";

class TaskModuleList extends React.PureComponent {
    static propTypes = {
        setCurrentTab: PropTypes.func.isRequired,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        data: PropTypes.oneOfType([PropTypes.object, () => null]),
        user: PropTypes.oneOfType([PropTypes.object, PropTypes.string, () => null]),
    };

    render() {
        const { data = null, height, setCurrentTab } = this.props;
        return (
            <div className="taskModule_all">
                <TitleModule additional="Все задачи" classNameTitle="taskModuleTittle" title="Список всех задач" />
                <div className="taskModuleAll_main">
                    <TableView
                        setCurrentTab={setCurrentTab}
                        height={height}
                        tasks={data ? data.tasks : null}
                        path="searchTable"
                    />
                </div>
            </div>
        );
    }
}
export default TaskModuleList;
