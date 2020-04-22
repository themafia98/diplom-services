// @ts-nocheck
import React from 'react';
import { taskModuleListType } from '../types';
import TableView from '../../../TableView';
import TitleModule from '../../../TitleModule';

class TaskModuleList extends React.PureComponent {
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
      <div className="taskModule_all">
        <TitleModule additional="Все задачи" classNameTitle="taskModuleTittle" title="Список всех задач" />
        <div className="taskModuleAll_main">
          <TableView
            loaderMethods={loaderMethods}
            setCurrentTab={setCurrentTab}
            height={height}
            router={router}
            tasks={data ? data.tasks : []}
            path="searchTable"
          />
        </div>
      </div>
    );
  }
}

export default TaskModuleList;
