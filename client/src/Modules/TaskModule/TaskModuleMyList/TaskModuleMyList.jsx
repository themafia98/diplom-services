import React, { useRef } from 'react';
import { taskModuleMyListType } from '../TaskModule.types';
import TableView from 'Components/TableView';
import Title from 'Components/Title';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { TABLE_TYPE } from 'Components/TableView/Table/Table.constant';
import { useTranslation } from 'react-i18next';

const TaskModuleMyList = ({ data, height, loading, counter, currentActionTab, statusApp }) => {
  const { t } = useTranslation();
  const refModuleTask = useRef(null);

  const { tasks = [] } = data || {};

  return (
    <div ref={refModuleTask} className="taskModule_all">
      <Title
        additional={t('taskModule_listPage_myListName')}
        classNameTitle="taskModuleTitle"
        title={t('taskModule_listPage_myListTitle')}
      />
      <div className="taskModuleAll_main">
        <TableView
          type={TABLE_TYPE.TASK}
          key={currentActionTab}
          counter={counter}
          height={height}
          dataSource={tasks}
          statusApp={statusApp}
          data={data}
          loading={loading}
          filterBy={['editor', 'uidCreater']}
          path="searchTable"
        />
      </div>
    </div>
  );
};

TaskModuleMyList.defaultProps = {
  router: {},
  data: {},
  height: 0,
  isBackground: false,
  visible: false,
};

TaskModuleMyList.propTypes = taskModuleMyListType;

export default moduleContextToProps(TaskModuleMyList);
