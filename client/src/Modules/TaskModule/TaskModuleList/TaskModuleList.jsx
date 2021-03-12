import React, { useRef } from 'react';
import { taskModuleListType } from '../TaskModule.types';
import TableView from 'Components/TableView';
import Title from 'Components/Title';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { TABLE_TYPE } from 'Components/TableView/Table/Table.constant';
import { useTranslation } from 'react-i18next';

const TaskModuleList = ({ router, data, height, loading, counter, statusApp }) => {
  const { t } = useTranslation();
  const refModuleTask = useRef(null);

  const { tasks = [] } = data || {};

  return (
    <div ref={refModuleTask} className="taskModule_all">
      <Title
        additional={t('taskModule_listPage_commonName')}
        classNameTitle="taskModuleTitle"
        title={t('taskModule_listPage_commonTitle')}
      />
      <div className="taskModuleAll_main">
        <TableView
          type={TABLE_TYPE.TASK}
          key="taskModule_tableTask"
          counter={counter}
          statusApp={statusApp}
          height={height || 500}
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
};

TaskModuleList.propTypes = taskModuleListType;

export default moduleContextToProps(TaskModuleList);
