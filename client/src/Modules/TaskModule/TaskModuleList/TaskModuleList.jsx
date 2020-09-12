import React, { useRef } from 'react';
import { taskModuleListType } from '../TaskModule.types';
import TableView from 'Components/TableView';
import TitleModule from 'Components/TitleModule';
import { moduleContextToProps } from 'Components/Helpers/moduleState';

const TaskModuleList = ({ router, data, height, loaderMethods, loading, counter, statusApp }) => {
  const refModuleTask = useRef(null);

  const { tasks = [] } = data || {};

  return (
    <div ref={refModuleTask} className="taskModule_all">
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
          dataSource={tasks}
          path="searchTable"
        />
      </div>
    </div>
  );
};

TaskModuleList.defaultProps = {
  router: {},
  data: {},
  height: 0,
  setCurrentTab: null,
  loaderMethods: {},
};

TaskModuleList.propTypes = taskModuleListType;

export default moduleContextToProps(TaskModuleList);
