// @ts-nocheck
import React from 'react';
import { taskModuleListType } from '../types';
import TableView from '../../../Components/TableView';
import TitleModule from '../../../Components/TitleModule';

class TaskModuleList extends React.PureComponent {
  refModuleTask = React.createRef();
  static propTypes = taskModuleListType;
  static defaultProps = {
    router: {},
    data: {},
    height: 0,
    setCurrentTab: null,
    loaderMethods: {},
    isBackground: false,
    visible: false,
  };

  render() {
    const { router, data, height, setCurrentTab, loaderMethods } = this.props;
    return (
      <div ref={this.refModuleTask} className="taskModule_all">
        <TitleModule additional="Все задачи" classNameTitle="taskModuleTittle" title="Список всех задач" />
        <div className="taskModuleAll_main">
          <TableView
            key="taskModule_tableTask"
            loaderMethods={loaderMethods}
            setCurrentTab={setCurrentTab}
            height={height}
            router={router}
            dataSource={data ? data.tasks : []}
            path="searchTable"
          />
        </div>
      </div>
    );
  }
}

export default TaskModuleList;
