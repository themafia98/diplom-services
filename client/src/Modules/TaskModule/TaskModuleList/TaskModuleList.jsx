import React from 'react';
import { taskModuleListType } from '../types';
import TableView from 'Components/TableView';
import TitleModule from 'Components/TitleModule';
import { moduleContextToProps } from 'Components/Helpers/moduleState';

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
    const { router, data, height, loaderMethods, loading, counter, statusApp } = this.props;

    return (
      <div ref={this.refModuleTask} className="taskModule_all">
        <TitleModule additional="Все задачи" classNameTitle="taskModuleTitle" title="Список всех задач" />
        <div className="taskModuleAll_main">
          <TableView
            key="taskModule_tableTask"
            loaderMethods={loaderMethods}
            counter={counter}
            statusApp={statusApp}
            height={height}
            router={router}
            loading={loading}
            dataSource={data ? data.tasks : []}
            path="searchTable"
          />
        </div>
      </div>
    );
  }
}

export default moduleContextToProps(TaskModuleList);
