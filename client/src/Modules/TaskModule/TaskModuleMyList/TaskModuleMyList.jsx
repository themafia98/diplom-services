// @ts-nocheck
import React from 'react';
import { taskModuleMyListType } from '../types';
import TableView from '../../../Components/TableView';
import TitleModule from '../../../Components/TitleModule';

class TaskModuleMyList extends React.PureComponent {
  refModuleTask = React.createRef();
  static propTypes = taskModuleMyListType;
  static defaultProps = {
    router: {},
    udata: {},
    data: {},
    height: 0,
    setCurrentTab: null,
    loaderMethods: {},
    isBackground: false,
    visible: false,
  };

  render() {
    const { udata, data, height, setCurrentTab } = this.props;
    return (
      <div ref={this.refModuleTask} className="taskModule_all">
        <TitleModule additional="Мои задачи" classNameTitle="taskModuleTittle" title="Список моих задач" />
        <div className="taskModuleAll_main">
          <TableView
            setCurrentTab={setCurrentTab}
            height={height}
            tasks={data ? data.tasks : []}
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
