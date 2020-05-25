// @ts-nocheck
import React from 'react';
import { taskModuleMyListType } from '../types';
import TableView from 'Components/TableView';
import TitleModule from 'Components/TitleModule';

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
    const { udata, data, height, setCurrentTab, loading, counter, currentActionTab, statusApp } = this.props;
    const { tasks = [] } = data || {};
    return (
      <div ref={this.refModuleTask} className="taskModule_all">
        <TitleModule additional="Мои задачи" classNameTitle="taskModuleTittle" title="Список моих задач" />
        <div className="taskModuleAll_main">
          <TableView
            key={currentActionTab}
            setCurrentTab={setCurrentTab}
            counter={counter}
            height={height}
            dataSource={tasks}
            statusApp={statusApp}
            data={data}
            loading={loading}
            filterBy={['editor', 'uidCreater']}
            udata={udata}
            path="searchTable"
          />
        </div>
      </div>
    );
  }
}
export default TaskModuleMyList;
