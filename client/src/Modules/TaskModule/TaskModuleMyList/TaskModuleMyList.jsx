import React, { useRef } from 'react';
import { taskModuleMyListType } from '../TaskModule.types';
import TableView from 'Components/TableView';
import TitleModule from 'Components/TitleModule';
import { moduleContextToProps } from 'Components/Helpers/moduleState';

const TaskModuleMyList = ({ udata, data, height, loading, counter, currentActionTab, statusApp }) => {
  const refModuleTask = useRef(null);

  const { tasks = [] } = data || {};

  return (
    <div ref={refModuleTask} className="taskModule_all">
      <TitleModule additional="Мои задачи" classNameTitle="taskModuleTitle" title="Список моих задач" />
      <div className="taskModuleAll_main">
        <TableView
          key={currentActionTab}
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
};

TaskModuleMyList.defaultProps = {
  router: {},
  udata: {},
  data: {},
  height: 0,
  loaderMethods: {},
  isBackground: false,
  visible: false,
};

TaskModuleMyList.propTypes = taskModuleMyListType;

export default moduleContextToProps(TaskModuleMyList);
