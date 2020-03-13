import React from 'react';
import PropTypes from 'prop-types';
import TableView from '../../../TableView';
import TitleModule from '../../../TitleModule';

class TaskModuleMyList extends React.PureComponent {
  static propTypes = {
    setCurrentTab: PropTypes.func.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    data: PropTypes.oneOfType([PropTypes.object, () => null]),
  };

  render() {
    const { udata = {}, data = null, height, setCurrentTab } = this.props;

    return (
      <div ref={this.refModuleTask} className="taskModule_all">
        <TitleModule additional="Мои задачи" classNameTitle="taskModuleTittle" title="Список моих задач" />
        <div className="taskModuleAll_main">
          <TableView
            setCurrentTab={setCurrentTab}
            height={height}
            tasks={data ? data.tasks : null}
            data={data}
            flag={true}
            udata={udata}
            path="searchTable"
          />
        </div>
      </div>
    );
  }
}
export default TaskModuleMyList;
