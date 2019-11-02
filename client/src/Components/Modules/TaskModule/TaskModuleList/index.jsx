import React from "react";
import _ from "lodash";
import TableView from "../../../TableView";
import TitleModule from "../../../TitleModule";

class TaskModuleList extends React.PureComponent {
    state = {
        height: null,
    };
    moduleTask = null;
    refModuleTask = node => (this.moduleTask = node);

    componentDidMount = () => {
        const { height } = this.state;
        if (_.isNull(height) && !_.isNull(this.moduleTask)) {
            this.setState({ height: this.moduleTask.getBoundingClientRect().height });
        }
    };

    componentDidUpdate = () => {
        const { height: heightState } = this.state;
        if (_.isNull(heightState) && !_.isNull(this.moduleTask)) {
            const height = this.moduleTask.getBoundingClientRect().height;
            if (height !== heightState) this.setState({ height: height });
        }
    };

    render() {
        const { data = null } = this.props;
        const { height } = this.state;
        return (
            <div ref={this.refModuleTask} className="taskModule_all">
                <TitleModule additional="Все задачи" classNameTitle="taskModuleTittle" title="Список всех задач" />
                <div className="taskModuleAll_main">
                    <TableView height={height} tasks={data ? data.tasks : null} path="searchTable" />
                </div>
            </div>
        );
    }
}
export default TaskModuleList;
